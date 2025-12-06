import { supabase } from "@/lib/supabaseClient";

export const createMeeting = async (meetingData) => {
    try {
        if (!meetingData.userId) {
            throw new Error("User ID is required");
        }

        if (!meetingData.filePath || !meetingData.fileName) {
            throw new Error("File path and name are required");
        }

        const { data, error } = await supabase
            .from("meetings")
            .insert({
                user_id: meetingData.userId,
                meeting_name: meetingData.meetingName,
                video_title: meetingData.title || meetingData.fileName,
                description: meetingData.description || "",
                file_path: meetingData.filePath,
                file_name: meetingData.fileName,
                file_size: meetingData.fileSize,
                file_type: meetingData.fileType, // 'audio' or 'video'
                duration: meetingData.duration || null,
                transcript: meetingData.transcript || null,
                summary: meetingData.summary || null,
                key_points: meetingData.keyPoints || null,
                action_items: meetingData.actionItems || null,
                tags: meetingData.tags || [],
                status: "uploaded", // 'uploaded', 'processing', 'completed', 'failed'
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select();

        if (error) {
            throw new Error(error.message || "Failed to create meeting record");
        }

        return {
            success: true,
            data: data?.[0],
        };
    } catch (error) {
        console.error("Create meeting error:", error);
        return {
            success: false,
            error: error.message || "Failed to create meeting",
        };
    }
};

export const getMeeting = async (meetingId) => {
    try {
        if (!meetingId) {
            throw new Error("Meeting ID is required");
        }

        const { data, error } = await supabase
            .from("meetings")
            .select("*")
            .eq("id", meetingId)
            .single();

        if (error) {
            throw new Error(error.message || "Failed to fetch meeting");
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Get meeting error:", error);
        return {
            success: false,
            error: error.message || "Failed to get meeting",
        };
    }
};

export const getUserMeetings = async (userId, options = {}) => {
    try {
        if (!userId) {
            throw new Error("User ID is required");
        }

        const {
            limit = 20,
            offset = 0,
            sortBy = "created_at",
            sortOrder = "desc",
            status = null,
        } = options;

        let query = supabase
            .from("meetings")
            .select("*", { count: "exact" })
            .eq("user_id", userId);

        if (status) {
            query = query.eq("status", status);
        }

        const { data, error, count } = await query
            .order(sortBy, { ascending: sortOrder === "asc" })
            .range(offset, offset + limit - 1);

        if (error) {
            throw new Error(error.message || "Failed to fetch meetings");
        }

        return {
            success: true,
            data,
            count,
        };
    } catch (error) {
        console.error("Get user meetings error:", error);
        return {
            success: false,
            error: error.message || "Failed to get meetings",
        };
    }
};

export const updateMeeting = async (meetingId, updates) => {
    try {
        if (!meetingId) {
            throw new Error("Meeting ID is required");
        }

        const { data, error } = await supabase
            .from("meetings")
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq("id", meetingId)
            .select();

        if (error) {
            throw new Error(error.message || "Failed to update meeting");
        }

        return {
            success: true,
            data: data?.[0],
        };
    } catch (error) {
        console.error("Update meeting error:", error);
        return {
            success: false,
            error: error.message || "Failed to update meeting",
        };
    }
};

export const deleteMeeting = async (meetingId) => {
    try {
        if (!meetingId) {
            throw new Error("Meeting ID is required");
        }

        const { error } = await supabase
            .from("meetings")
            .delete()
            .eq("id", meetingId);

        if (error) {
            throw new Error(error.message || "Failed to delete meeting");
        }

        return {
            success: true,
        };
    } catch (error) {
        console.error("Delete meeting error:", error);
        return {
            success: false,
            error: error.message || "Failed to delete meeting",
        };
    }
};


export const searchMeetings = async (userId, searchTerm) => {
    try {
        if (!userId) {
            throw new Error("User ID is required");
        }

        if (!searchTerm) {
            throw new Error("Search term is required");
        }

        const { data, error } = await supabase
            .from("meetings")
            .select("*")
            .eq("user_id", userId)
            .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message || "Failed to search meetings");
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Search meetings error:", error);
        return {
            success: false,
            error: error.message || "Failed to search meetings",
        };
    }
};
