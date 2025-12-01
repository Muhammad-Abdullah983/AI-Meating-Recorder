"use client";
import React, { useState, useRef } from 'react';
import { Image, Upload } from 'lucide-react';

const ImageUploadBox = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    // Placeholder for the main functionality
    const handleFileUpload = (selectedFile) => {
        if (selectedFile) {
            console.log('File selected:', selectedFile.name);
            setFile(selectedFile);

        }
    };

    // Handles files selected via the native file input dialog
    const handleChooseFile = (event) => {
        handleFileUpload(event.target.files[0]);
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
        // Keep dragging state active while dragging over the area
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
    ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}
  `;

    const dropAreaClasses = `
    p-10 text-center
    bg-white
    border-2 border-dashed
    rounded-xl
    transition-colors duration-300
    cursor-pointer
    hover:bg-gray-50
    ${isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}
  `;

    return (

        <div className="py-10 md:py-16 bg-gray-50 min-h-screen  items-start justify-center">
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                    Upload  Audio/Video
                </h1>
                <p className="text-base text-gray-500 max-w-xl mx-auto">
                    Upload a clear audio or video recording of your meeting to get instant transcription and insights powered by AI
                </p>
            </div>
            <div className={uploadBoxClasses}>

                {/* Header */}


                {/* Drag and Drop Area */}
                <div
                    className={dropAreaClasses}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                >
                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleChooseFile}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.gif,.webp"
                    />

                    {file ? (
                        <div className="text-green-600 font-semibold text-lg">
                            <Check className="w-6 h-6 inline-block mr-2" />
                            File Selected: {file.name}
                        </div>
                    ) : (
                        <>
                            {/* Central Icon */}
                            <div className="
                w-16 h-16 mx-auto mb-4
                bg-green-100
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
                  bg-teal-700
                  text-white
                  font-semibold
                  rounded-lg
                  shadow-md
                  hover:bg-teal-600
                  transition duration-200
                "
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent the click from bubbling up to the drop area div
                                    fileInputRef.current.click();
                                }}
                            >
                                <Upload className="w-5 h-5" />
                                Choose File
                            </button>
                        </>
                    )}
                    <div className="mt-6 text-center text-sm text-gray-500">
                        <span className="font-medium">
                            <span role="img" aria-label="camera">📸</span> JPG, PNG, GIF, WebP
                        </span>
                        <span className="mx-3">•</span>
                        <span className="font-medium">
                            Max 10MB
                        </span>
                    </div>

                </div>

                {/* Constraints / File Info */}


            </div>
        </div>
    );
};

export default ImageUploadBox;