"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Camera, Upload as UploadIcon } from 'lucide-react';

const ProfilePage = () => {
    const fileInputRef = useRef(null);
    const { user } = useSelector(state => state.auth);
    const userId = user?.id;

    const defaultProfile = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        role: 'Product Manager',
        department: 'AI Solutions',
        location: 'New York, USA',
        bio: 'Passionate about building smart AI meeting solutions.',
        linkedin: '',
        github: ''
    };

    const [profile, setProfile] = useState(defaultProfile);
    const [profilePicture, setProfilePicture] = useState('/profile-pic.jpg');
    const [previewPicture, setPreviewPicture] = useState('/profile-pic.jpg');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Load profile from localStorage on component mount
    useEffect(() => {
        if (typeof window !== 'undefined' && userId) {
            const savedProfile = localStorage.getItem(`userProfile_${userId}`);
            const savedProfilePicture = localStorage.getItem(`profilePicture_${userId}`);

            if (savedProfile) {
                try {
                    setProfile(JSON.parse(savedProfile));
                } catch (error) {
                    console.error('Error loading profile:', error);
                }
            }

            if (savedProfilePicture) {
                setProfilePicture(savedProfilePicture);
                setPreviewPicture(savedProfilePicture);
            }
        }
    }, [userId]); const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setMessage('Please select a valid image file');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setMessage('Image size must be less than 5MB');
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewPicture(reader.result);
            };
            reader.readAsDataURL(file);
            setMessage('');
        }
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            // Save to localStorage with user-specific key
            if (typeof window !== 'undefined' && userId) {
                localStorage.setItem(`userProfile_${userId}`, JSON.stringify(profile));
                localStorage.setItem(`profilePicture_${userId}`, previewPicture);
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setProfilePicture(previewPicture);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error saving profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fGFpfGVufDB8fDB8fHww")' }}>
                {/* Overlay for better contrast */}
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                    <div className="relative">
                        <img
                            src={previewPicture}
                            alt="Profile"
                            className="w-32 h-32 rounded-full border-4 border-white object-cover"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition"
                        >
                            <Camera className="w-5 h-5 text-teal-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
            />

            {/* Profile Form */}
            <div className="max-w-5xl mx-auto mt-20 px-4 sm:px-6 lg:px-8 pb-8">
                <div className="bg-white shadow-lg rounded-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>

                    {/* Message */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    <div className="grid grid-cols-1 text-black md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-black">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                placeholder="Enter your first name"
                                value={profile.firstName}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Enter your last name"
                                value={profile.lastName}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={profile.email}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="text"
                                name="phone"
                                placeholder="Enter your phone number"
                                value={profile.phone}
                                onChange={handleChange}

                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <input
                                type="text"
                                name="role"
                                placeholder="Enter your role"
                                value={profile.role}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Department</label>
                            <input
                                type="text"
                                name="department"
                                placeholder="Enter your department"
                                value={profile.department}
                                onChange={handleChange}

                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Location</label>
                            <input
                                type="text"
                                name="location"
                                placeholder="Enter your location"
                                value={profile.location}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Bio</label>
                            <textarea
                                name="bio"
                                placeholder="Tell us about yourself"
                                value={profile.bio}
                                onChange={handleChange}

                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                            <input
                                type="text"
                                name="linkedin"
                                placeholder="Enter your LinkedIn URL"
                                value={profile.linkedin}
                                onChange={handleChange}

                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">GitHub</label>
                            <input
                                type="text"
                                name="github"
                                placeholder="Enter your GitHub URL"
                                value={profile.github}
                                onChange={handleChange}

                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg shadow-md hover:bg-gray-300 transition flex items-center gap-2"
                        >
                            <UploadIcon className="w-5 h-5" />
                            Change Picture
                        </button>
                        <button
                            onClick={handleSaveChanges}
                            disabled={loading}
                            className="px-6 py-3 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
