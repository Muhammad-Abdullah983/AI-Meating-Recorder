/**
 * File validation utilities
 */

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
    audio: 50 * 1024 * 1024, // 50 MB for audio
    video: 500 * 1024 * 1024, // 500 MB for video
    image: 5 * 1024 * 1024, // 5 MB for images
};

// Supported file formats
export const SUPPORTED_FORMATS = {
    audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/webm'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
};

/**
 * Validates if a file is of the correct type
 * @param {File} file - The file to validate
 * @param {string} category - The category (audio, video, image)
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateFileType = (file, category) => {
    if (!file) {
        return { valid: false, error: 'No file provided' };
    }

    const supportedFormats = SUPPORTED_FORMATS[category];
    if (!supportedFormats) {
        return { valid: false, error: 'Invalid category' };
    }

    const isValidType = supportedFormats.some(format => file.type.startsWith(format.split('/')[0]));

    if (!isValidType) {
        const formatNames = supportedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ');
        return {
            valid: false,
            error: `Invalid file format. Supported formats: ${formatNames}`
        };
    }

    return { valid: true, error: null };
};

/**
 * Validates if a file size is within limits
 * @param {File} file - The file to validate
 * @param {string} category - The category (audio, video, image)
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateFileSize = (file, category) => {
    if (!file) {
        return { valid: false, error: 'No file provided' };
    }

    const sizeLimit = FILE_SIZE_LIMITS[category];
    if (!sizeLimit) {
        return { valid: false, error: 'Invalid category' };
    }

    if (file.size > sizeLimit) {
        const limitInMB = (sizeLimit / (1024 * 1024)).toFixed(0);
        return {
            valid: false,
            error: `File size exceeds ${limitInMB}MB limit. Please compress your file.`
        };
    }

    return { valid: true, error: null };
};

/**
 * Comprehensive file validation
 * @param {File} file - The file to validate
 * @param {string} category - The category (audio, video, image)
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateFile = (file, category) => {
    if (!file) {
        return { valid: false, error: 'Please select a file' };
    }

    // Validate file type
    const typeValidation = validateFileType(file, category);
    if (!typeValidation.valid) {
        return typeValidation;
    }

    // Validate file size
    const sizeValidation = validateFileSize(file, category);
    if (!sizeValidation.valid) {
        return sizeValidation;
    }

    return { valid: true, error: null };
};

/**
 * Formats file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Gets the file category based on MIME type
 * @param {File} file - The file to check
 * @returns {string|null} - The category (audio, video, image) or null
 */
export const getFileCategory = (file) => {
    if (!file || !file.type) return null;

    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('image/')) return 'image';

    return null;
};
