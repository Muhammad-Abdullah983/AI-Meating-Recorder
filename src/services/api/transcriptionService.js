import { supabase } from "@/lib/supabaseClient";

/**
 * Service to trigger and manage transcription processing via Supabase Edge Function
 */

/**
 * Retry logic with exponential backoff
 */
const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const isRateLimitError = error.message?.includes('429') ||
                error.message?.includes('Resource exhausted') ||
                error.message?.includes('quota');

            if (isRateLimitError && attempt < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, attempt); // Exponential backoff
                console.log(`Rate limited. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
};

/**
 * Call the edge function to process transcription
 * @param {Object} params - Parameters for transcription
 * @returns {Promise<{success: boolean, data: Object, error: string}>}
 */
export const triggerTranscriptionProcessing = async ({
    filePath,
    fileType,
    fileName,
    userId,
    meetingId,
}) => {
    try {
        if (!filePath || !fileType || !fileName || !userId) {
            throw new Error("Missing required parameters: filePath, fileType, fileName, userId");
        }

        const payload = {
            filePath,
            fileType,
            fileName,
            userId,
            meetingId: meetingId || null,
        };

        console.log("Triggering transcription processing:", payload);

        // Get the session token for authentication
        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
            throw new Error("User not authenticated");
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const edgeFunctionUrl = `${supabaseUrl}/functions/v1/generate-transcription`;

        console.log("Calling edge function via fetch:", edgeFunctionUrl);

        // Call with retry logic
        const response = await retryWithBackoff(async () => {
            const res = await fetch(edgeFunctionUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok && (res.status === 429 || res.status >= 500)) {
                throw new Error(`HTTP ${res.status}: Rate limited or server error`);
            }

            return res;
        }, 3, 2000);

        console.log("Edge function response status:", response.status);

        const data = await response.json();
        console.log("Edge function response data:", data);

        if (!response.ok) {
            throw new Error(data?.error || `HTTP ${response.status}`);
        }

        if (!data.success) {
            throw new Error(data?.error || "Failed to process transcription");
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Transcription processing error:", error);
        return {
            success: false,
            error: error.message || "Failed to trigger transcription",
        };
    }
};


export const getTranscriptionStatus = async (meetingId) => {
    try {
        if (!meetingId) {
            throw new Error("Meeting ID is required");
        }

        const { data, error } = await supabase
            .from("meetings")
            .select("id, status, transcript, summary, key_points, action_items, error_message, processed_at")
            .eq("id", meetingId)
            .single();

        if (error) {
            throw new Error(error.message || "Failed to fetch status");
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Get status error:", error);
        return {
            success: false,
            error: error.message || "Failed to get transcription status",
        };
    }
};

/**
 * Fetch transcription results for a meeting
 * @param {string} meetingId - Meeting ID
 * @returns {Promise<{success: boolean, data: Object, error: string}>}
 */
export const getTranscriptionResults = async (meetingId) => {
    try {
        if (!meetingId) {
            throw new Error("Meeting ID is required");
        }

        const { data, error } = await supabase
            .from("meetings")
            .select("transcript, summary, key_points, action_items, status, processed_at")
            .eq("id", meetingId)
            .single();

        if (error) {
            throw new Error(error.message || "Failed to fetch results");
        }

        if (data.status !== "completed") {
            throw new Error(`Meeting still processing. Status: ${data.status}`);
        }

        return {
            success: true,
            data: {
                transcript: data.transcript,
                summary: data.summary,
                keyPoints: data.key_points || [],
                actionItems: data.action_items || [],
                processedAt: data.processed_at,
            },
        };
    } catch (error) {
        console.error("Get results error:", error);
        return {
            success: false,
            error: error.message || "Failed to get transcription results",
        };
    }
};

/**
 * Poll for transcription completion
 * @param {string} meetingId - Meeting ID
 * @param {number} maxAttempts - Maximum polling attempts
 * @param {number} interval - Polling interval in milliseconds
 * @returns {Promise<{success: boolean, data: Object, error: string}>}
 */
export const pollTranscriptionCompletion = async (
    meetingId,
    maxAttempts = 60,
    interval = 2000
) => {
    try {
        if (!meetingId) {
            throw new Error("Meeting ID is required");
        }

        let attempts = 0;

        while (attempts < maxAttempts) {
            const { data, error } = await supabase
                .from("meetings")
                .select("status, transcript, summary, key_points, action_items, error_message")
                .eq("id", meetingId)
                .single();

            if (error) {
                throw new Error(error.message || "Failed to check status");
            }

            if (data.status === "completed") {
                return {
                    success: true,
                    data: {
                        status: "completed",
                        transcript: data.transcript,
                        summary: data.summary,
                        keyPoints: data.key_points || [],
                        actionItems: data.action_items || [],
                    },
                };
            }

            if (data.status === "failed") {
                throw new Error(`Transcription failed: ${data.error_message}`);
            }

            attempts++;

            if (attempts < maxAttempts) {
                await new Promise((resolve) => setTimeout(resolve, interval));
            }
        }

        throw new Error("Transcription processing timeout");
    } catch (error) {
        console.error("Poll error:", error);
        return {
            success: false,
            error: error.message || "Polling failed",
        };
    }
};
