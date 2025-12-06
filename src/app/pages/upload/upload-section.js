"use client";
import React, { useState, useRef } from 'react';
import { Image, Upload, Check, AlertCircle, Loader } from 'lucide-react';
import { useSelector } from 'react-redux';
import { uploadFile } from '@/services/storage/fileUploadService';
import { createMeeting } from '@/services/api/meetingService';
import { triggerTranscriptionProcessing } from '@/services/api/transcriptionService';
import { useRouter } from 'next/navigation';
import { validateFile, getFileCategory, formatFileSize } from '@/lib/fileValidation';

const ImageUploadBox = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', or null
    const [uploadMessage, setUploadMessage] = useState('');
    const fileInputRef = useRef(null);
    const { user } = useSelector(state => state.auth);
    const router = useRouter();

    // Handle file upload to Supabase
    const handleFileUpload = async (selectedFile) => {
        if (!selectedFile) return;

        const fileCategory = getFileCategory(selectedFile);
        if (!fileCategory || (fileCategory !== 'audio' && fileCategory !== 'video')) {
            setUploadStatus('error');
            setUploadMessage('Please select a valid audio or video file');
            setTimeout(() => setUploadStatus(null), 3000);
            return;
        }

        // Validate file with comprehensive validation
        const validation = validateFile(selectedFile, fileCategory);
        if (!validation.valid) {
            setUploadStatus('error');
            setUploadMessage(validation.error);
            setTimeout(() => setUploadStatus(null), 3000);
            return;
        }

        setFile(selectedFile);
        setUploading(true);
        setUploadStatus(null);

        try {
            if (!user?.id || !user?.email) {
                throw new Error('User not authenticated');
            }

            // Step 1: Upload file to Supabase Storage
            console.log('Uploading file to storage...');
            setUploadMessage('Uploading file...');
            const uploadResult = await uploadFile(selectedFile, user.id, user.email, fileCategory);

            if (!uploadResult.success) {
                throw new Error(uploadResult.error);
            }

            setUploadMessage('File uploaded! Creating meeting record...');

            // Step 2: Create meeting record in database
            console.log('Creating meeting record...');
            const meetingResult = await createMeeting({
                userId: user.id,
                filePath: uploadResult.path,
                fileName: uploadResult.fileName,
                fileSize: uploadResult.fileSize,
                fileType: fileCategory,
                title: selectedFile.name.split('.')[0] || 'Meeting Recording',
                meetingName: 'Meeting - ' + new Date().toLocaleDateString(),
                description: `Uploaded on ${new Date().toLocaleDateString()}`,
            });

            if (!meetingResult.success) {
                throw new Error(meetingResult.error || 'Failed to create meeting record');
            }

            const meetingId = meetingResult.data?.id;

            setUploadMessage('Starting AI transcription and analysis...');

            // Step 3: Trigger transcription processing via edge function
            console.log('Triggering transcription processing...');
            const transcriptionResult = await triggerTranscriptionProcessing({
                filePath: uploadResult.path,
                fileType: fileCategory,
                fileName: uploadResult.fileName,
                userId: user.id,
                meetingId: meetingId,
            });

            if (!transcriptionResult.success) {
                console.error('Transcription error:', transcriptionResult.error);

                // Check if it's a rate limit error
                const isRateLimitError = transcriptionResult.error?.includes('Resource exhausted') ||
                    transcriptionResult.error?.includes('429') ||
                    transcriptionResult.error?.includes('quota');

                setUploadStatus('warning');

                if (isRateLimitError) {
                    setUploadMessage(`✅ File uploaded successfully! Meeting created (ID: ${meetingId}). API quota limit reached - Transcription queued and will process shortly.`);
                } else {
                    setUploadMessage(`✅ File uploaded successfully! Meeting created (ID: ${meetingId}). Transcription processing in background...`);
                }

                setFile(null);
                setTimeout(() => setUploadStatus(null), 7000);
            } else {
                setUploadStatus('success');
                setUploadMessage(`✅ File uploaded and transcription completed! Meeting ID: ${meetingId}`);
                setFile(null);
                console.log('Transcription result:', transcriptionResult.data);
                setTimeout(() => setUploadStatus(null), 5000);
            }
            router.push('/details/' + meetingId);
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');

            // Provide specific error messages
            let errorMessage = error.message || 'Failed to process file';

            if (errorMessage.includes('exceeds') && errorMessage.includes('MB')) {
                errorMessage = '❌ File size too large. Maximum: 50MB (Audio) or 500MB (Video). Please compress your file.';
            } else if (errorMessage.includes('Invalid') && errorMessage.includes('format')) {
                errorMessage = '❌ Invalid file format. Supported: MP4, WebM, Ogg (video) or MP3, WAV, AAC (audio)';
            } else if (errorMessage.includes('authenticated')) {
                errorMessage = '❌ Not authenticated. Please log in again.';
            } else {
                errorMessage = `❌ ${errorMessage}`;
            }

            setUploadMessage(errorMessage);
            setTimeout(() => setUploadStatus(null), 6000);
        } finally {
            setUploading(false);
        }
    };

    // Handles files selected via the native file input dialog
    const handleChooseFile = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setUploadStatus(null);
            setUploadMessage('');
        }
    };

    // Cancel file selection
    const handleCancel = () => {
        setFile(null);
        setUploadStatus(null);
        setUploadMessage('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Proceed with upload
    const handleUpload = async () => {
        if (file) {
            await handleFileUpload(file);
        }
    };

    // Drag and Drop Handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const uploadBoxClasses = `
    p-8 md:p-12
    bg-white
    rounded-2xl
    shadow-lg
    max-w-3xl
    mx-auto
    transition-all duration-300
    relative
    ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}
  `;

    const dropAreaClasses = `
    p-10 text-center
    bg-white
    border-2 border-dashed
    rounded-xl
    transition-colors duration-300
    cursor-pointer
    hover:bg-teal-50
    hover:border-teal-500
    ${isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}
  `;

    return (

        <div className="max-w-7xl sm:w-[95%] w-[88%] mx-auto py-10 md:py-16 bg-gray-50 min-h-screen items-start justify-center">
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                    Upload Audio/Video
                </h1>
                <p className="text-base text-gray-500 max-w-xl mx-auto">
                    Upload a clear audio or video recording of your meeting to get instant transcription and insights powered by AI
                </p>
            </div>

            {/* Upload Status Messages */}
            {uploadStatus && (
                <div className={`max-w-3xl mx-auto mb-6 px-4 ${uploadBoxClasses}`}>
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${uploadStatus === 'success'
                        ? 'bg-green-300 text-black border border-green-300'
                        : uploadStatus === 'warning'
                            ? 'bg-yellow-500 text-black border border-yellow-500'
                            : 'bg-red-100 text-red-700 border border-red-300'
                        }`}>
                        {uploadStatus === 'success' ? (
                            <Check className="w-5 h-5 shrink-0" />
                        ) : uploadStatus === 'warning' ? (
                            <AlertCircle className="w-5 h-5 shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 shrink-0" />
                        )}
                        <span className="flex-1">{uploadMessage}</span>
                        {uploading && <Loader className="w-5 h-5 animate-spin shrink-0" />}
                    </div>
                </div>
            )}

            {/* File Preview or Upload Area */}
            {file ? (
                // File Selected - Show Preview
                <div className={uploadBoxClasses}>
                    {/* Cancel Button - Top Right */}
                    <button
                        onClick={handleCancel}
                        disabled={uploading}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Cancel"
                    >
                        ✕
                    </button>

                    {/* Inner Preview Container */}
                    <div className="bg-gray-100 rounded-lg p-0 mb-6 border-2 border-gray-300 max-h-96 flex flex-col items-center justify-center overflow-hidden">
                        {/* File Preview - Show audio/video player */}
                        {file.type.startsWith('audio/') ? (
                            <audio
                                controls
                                className="w-full h-full"
                                src={URL.createObjectURL(file)}
                            />
                        ) : file.type.startsWith('video/') ? (
                            <video
                                controls
                                className="w-full h-full object-cover"
                                src={URL.createObjectURL(file)}
                            />
                        ) : null}
                    </div>

                    {/* Outer Action Buttons Container */}
                    <div className="flex gap-4 justify-center mb-4">
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                await handleUpload();
                            }}
                            disabled={uploading}
                            className="
                                flex items-center justify-center
                                gap-2
                                px-8 py-3
                                bg-teal-600
                                text-white
                                font-semibold
                                rounded-lg
                                shadow-md
                                hover:bg-teal-700
                                transition duration-200
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                            "
                        >
                            {uploading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Upload
                                </>
                            )}
                        </button>
                    </div>

                    {/* File Details */}
                    <div className="text-center">
                        <p className="text-gray-800 font-semibold text-base mb-1">
                            {file.name}
                        </p>
                        <p className="text-gray-600 text-sm">
                            Size: {formatFileSize(file.size)}
                        </p>
                    </div>
                </div>
            ) : (
                // No File Selected - Show Drop Area
                <div className={uploadBoxClasses}>
                    <div
                        className={dropAreaClasses}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => !uploading && !file && fileInputRef.current.click()}
                    >
                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleChooseFile}
                            className="hidden"
                            accept="audio/*,video/*"
                            disabled={uploading}
                        />

                        {uploading ? (
                            <div className="text-blue-600 font-semibold text-lg">
                                <div className="w-6 h-6 mx-auto mb-2 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                Uploading file...
                            </div>
                        ) : (
                            <>
                                {/* Central Icon */}
                                <div className="
                    w-16 h-16 mx-auto mb-4
                    bg-gray-200
                    text-teal-600
                    rounded-full
                    flex items-center justify-center
                  ">
                                    <Image className="w-8 h-8" />
                                </div>

                                {/* Instructions */}
                                <p className="text-lg font-semibold text-gray-700 mb-1">
                                    Drag & Drop your file here
                                </p>
                                <p className="text-sm text-gray-500 mb-6">
                                    or click to browse files from your computer
                                </p>

                                {/* Choose File Button (Visually triggers the hidden input) */}
                                <button
                                    type="button"
                                    className="
                      flex items-center justify-center mx-auto
                      gap-2
                      px-6 py-3
                      bg-teal-600
                      text-white
                      font-semibold
                      rounded-lg
                      shadow-md
                      hover:bg-teal-700
                      transition duration-200
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current.click();
                                    }}
                                    disabled={uploading}
                                >
                                    <Upload className="w-5 h-5" />
                                    Choose File
                                </button>
                            </>
                        )}
                        <div className="mt-6 text-center text-sm text-gray-500">
                            <span className="font-medium">
                                <span role="img" aria-label="camera">🎵</span> Audio (MP3, WAV, etc.)
                            </span>
                            <span className="mx-3">•</span>
                            <span className="font-medium">
                                <span role="img" aria-label="video">🎬</span> Video (MP4, WebM, etc.)
                            </span>
                            <br />
                            <span className="font-medium mt-2 block">
                                Max 50MB (Audio) / 100MB (Video)
                            </span>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploadBox;