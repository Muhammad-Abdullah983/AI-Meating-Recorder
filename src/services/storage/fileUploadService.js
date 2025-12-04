import { supabase } from "@/lib/supabaseClient";

const STORAGE_BUCKET = "ai_meetings"; // Your bucket name

/**
 * Get formatted date for folder structure (YYYY-MM-DD)
 */
const getFormattedDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
};

export const uploadFile = async (file, userId, userName, fileType = "audio") => {
    try {
        if (!file) {
            throw new Error("No file provided");
        }

        if (!userId || !userName) {
            throw new Error("User ID and name are required");
        }

        // Validate file type
        const allowedAudioTypes = [
            "audio/mpeg",
            "audio/wav",
            "audio/mp4",
            "audio/ogg",
            "audio/webm",
            "audio/aac",
            "audio/flac",
        ];
        const allowedVideoTypes = [
            "video/mp4",
            "video/webm",
            "video/ogg",
            "video/quicktime",
            "video/x-msvideo",
            "video/x-matroska",
        ];

        const allowedTypes =
            fileType === "video" ? allowedVideoTypes : allowedAudioTypes;

        if (!allowedTypes.includes(file.type)) {
            throw new Error(
                `Invalid ${fileType} format. Supported formats: ${allowedTypes.join(", ")}`
            );
        }

        // Validate file size (max 500MB for video, 50MB for audio)
        const maxSize = fileType === "video" ? 500 * 1024 * 1024 : 50 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error(
                `File size exceeds ${maxSize / (1024 * 1024)}MB limit. Please upload a smaller file.`
            );
        }

        // Create a unique file path with folder structure: date/username/fileType/filename
        const date = getFormattedDate();
        const timestamp = new Date().getTime();
        const fileExt = file.name.split(".").pop();
        const fileName = `${fileType}-${timestamp}.${fileExt}`;

        // Sanitize username for folder name (remove special characters, convert to lowercase)
        const sanitizedUserName = userName
            .toLowerCase()
            .replace(/[^a-z0-9.-]/g, '')
            .slice(0, 50);

        // Create structured path: date/username/video|audio/filename
        const filePath = `${date}/${sanitizedUserName}/${fileType}/${fileName}`;

        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (error) {
            throw new Error(error.message || "Failed to upload file");
        }

        // Get public URL
        const { data: publicData } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(filePath);

        return {
            success: true,
            path: filePath,
            url: publicData.publicUrl,
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
            folderStructure: {
                date,
                userName: sanitizedUserName,
                fileType,
            }
        };
    } catch (error) {
        console.error("File upload error:", error);
        return {
            success: false,
            error: error.message || "File upload failed",
        };
    }
};

/**
 * Delete a file from Supabase Storage
 * @param {string} filePath - The file path in storage
 * @returns {Promise<{success: boolean, error: string}>}
 */
export const deleteFile = async (filePath) => {
    try {
        if (!filePath) {
            throw new Error("File path is required");
        }

        const { error } = await supabase.storage
            .from("ai_meetings")
            .remove([filePath]);

        if (error) {
            throw new Error(error.message || "Failed to delete file");
        }

        return {
            success: true,
        };
    } catch (error) {
        console.error("File deletion error:", error);
        return {
            success: false,
            error: error.message || "File deletion failed",
        };
    }
};

/**
 * List all files for a user
 * @param {string} userName - The user's name/email (sanitized)
 * @param {string} fileType - 'audio', 'video', or 'all' for both
 * @param {string} date - Optional date filter (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, files: Array, error: string}>}
 */
export const listUserFiles = async (userName, fileType = "all", date = null) => {
    try {
        if (!userName) {
            throw new Error("User name is required");
        }

        // Sanitize username
        const sanitizedUserName = userName
            .toLowerCase()
            .replace(/[^a-z0-9.-]/g, '')
            .slice(0, 50);

        // Use current date if not provided
        const targetDate = date || getFormattedDate();

        const paths = [];
        if (fileType === "audio" || fileType === "all") {
            paths.push(`${targetDate}/${sanitizedUserName}/audio`);
        }
        if (fileType === "video" || fileType === "all") {
            paths.push(`${targetDate}/${sanitizedUserName}/video`);
        }

        let allFiles = [];

        for (const path of paths) {
            const { data, error } = await supabase.storage
                .from("ai_meetings")
                .list(path, {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: "created_at", order: "desc" },
                });

            if (error && error.message !== "not found") {
                throw error;
            }

            if (data) {
                allFiles = [
                    ...allFiles,
                    ...data.map((file) => ({
                        ...file,
                        fullPath: `${path}/${file.name}`,
                    })),
                ];
            }
        }

        return {
            success: true,
            files: allFiles,
        };
    } catch (error) {
        console.error("List files error:", error);
        return {
            success: false,
            error: error.message || "Failed to list files",
        };
    }
};

/**
 * Get file download URL with optional expiration
 * @param {string} filePath - The file path in storage
 * @param {number} expiresIn - Expiration time in seconds (default: 3600)
 * @returns {Promise<{success: boolean, url: string, error: string}>}
 */
export const getFileDownloadUrl = async (filePath, expiresIn = 3600) => {
    try {
        if (!filePath) {
            throw new Error("File path is required");
        }

        const { data, error } = await supabase.storage
            .from("ai_meetings")
            .createSignedUrl(filePath, expiresIn);

        if (error) {
            throw new Error(error.message || "Failed to generate download URL");
        }

        return {
            success: true,
            url: data.signedUrl,
        };
    } catch (error) {
        console.error("Get download URL error:", error);
        return {
            success: false,
            error: error.message || "Failed to get download URL",
        };
    }
};
