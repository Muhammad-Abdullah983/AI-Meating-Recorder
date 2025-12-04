import { useState, useCallback } from 'react';
import { uploadFile, deleteFile, listUserFiles, getFileDownloadUrl } from '@/services/storage/fileUploadService';

export const useFileUpload = (userId) => {
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [listing, setListing] = useState(false);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);

    const handleUpload = useCallback(
        async (file, fileType = 'audio') => {
            if (!userId) {
                setError('User ID is required');
                return null;
            }

            setUploading(true);
            setError(null);

            try {
                const result = await uploadFile(file, userId, fileType);

                if (result.success) {
                    return result;
                } else {
                    setError(result.error);
                    return null;
                }
            } catch (err) {
                setError(err.message || 'Upload failed');
                return null;
            } finally {
                setUploading(false);
            }
        },
        [userId]
    );

    const handleDelete = useCallback(async (filePath) => {
        setDeleting(true);
        setError(null);

        try {
            const result = await deleteFile(filePath);

            if (result.success) {
                // Remove from files list
                setFiles(files.filter(f => f.fullPath !== filePath));
                return true;
            } else {
                setError(result.error);
                return false;
            }
        } catch (err) {
            setError(err.message || 'Deletion failed');
            return false;
        } finally {
            setDeleting(false);
        }
    }, [files]);

    const handleListFiles = useCallback(
        async (fileType = 'all') => {
            if (!userId) {
                setError('User ID is required');
                return [];
            }

            setListing(true);
            setError(null);

            try {
                const result = await listUserFiles(userId, fileType);

                if (result.success) {
                    setFiles(result.files);
                    return result.files;
                } else {
                    setError(result.error);
                    return [];
                }
            } catch (err) {
                setError(err.message || 'Failed to list files');
                return [];
            } finally {
                setListing(false);
            }
        },
        [userId]
    );

    const handleGetDownloadUrl = useCallback(async (filePath, expiresIn = 3600) => {
        try {
            const result = await getFileDownloadUrl(filePath, expiresIn);

            if (result.success) {
                return result.url;
            } else {
                setError(result.error);
                return null;
            }
        } catch (err) {
            setError(err.message || 'Failed to get download URL');
            return null;
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        uploading,
        deleting,
        listing,
        files,
        error,
        handleUpload,
        handleDelete,
        handleListFiles,
        handleGetDownloadUrl,
        clearError,
    };
};
