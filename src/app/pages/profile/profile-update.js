"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Camera, Upload as UploadIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, passwordSchema } from '@/lib/validationSchemas';
import FormInput from '@/components/ui/FormInput';
import FormTextarea from '@/components/ui/FormTextarea';

// Custom verified badge icon (blue filled with white check)
const VerifiedBadge = ({ className = "w-5 h-5" }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <path
            d="M12 2.75c.7 0 1.37.29 1.85.8l1.17 1.24 1.64-.38c.68-.16 1.41.06 1.88.56l1.2 1.25c.49.51.69 1.24.52 1.92l-.4 1.64 1.25 1.18c.52.49.82 1.17.82 1.87 0 .71-.3 1.39-.82 1.88l-1.25 1.18.4 1.64c.17.68-.03 1.41-.52 1.92l-1.2 1.25c-.47.5-1.2.72-1.88.56l-1.64-.38-1.17 1.24c-.48.51-1.15.8-1.85.8s-1.37-.29-1.85-.8l-1.17-1.24-1.64.38c-.68.16-1.41-.06-1.88-.56l-1.2-1.25c-.49-.51-.69-1.24-.52-1.92l.4-1.64-1.25-1.18c-.52-.49-.82-1.17-.82-1.88 0-.7.3-1.38.82-1.87l1.25-1.18-.4-1.64c-.17-.68.03-1.41.52-1.92l1.2-1.25c.47-.5 1.2-.72 1.88-.56l1.64.38 1.17-1.24c.48-.51 1.15-.8 1.85-.8Z"
            fill="#1e40af"
        />
        <path
            d="M9.2 12.4l2 2 3.8-3.8"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);

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

    const [profilePicture, setProfilePicture] = useState('/profile-pic.jpg');
    const [previewPicture, setPreviewPicture] = useState('/profile-pic.jpg');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('available');
    const [activeTab, setActiveTab] = useState('profile');

    // Profile form
    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        formState: { errors: profileErrors },
        watch: watchProfile,
        setValue: setProfileValue,
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: defaultProfile,
    });

    // Password form
    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
        reset: resetPassword,
    } = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const profile = watchProfile();

    // Load profile from localStorage on component mount
    useEffect(() => {
        if (typeof window !== 'undefined' && userId) {
            const savedProfile = localStorage.getItem(`userProfile_${userId}`);
            const savedProfilePicture = localStorage.getItem(`profilePicture_${userId}`);

            if (savedProfile) {
                try {
                    const parsedProfile = JSON.parse(savedProfile);
                    Object.keys(parsedProfile).forEach(key => {
                        setProfileValue(key, parsedProfile[key]);
                    });
                } catch (error) {
                    console.error('Error loading profile:', error);
                }
            }

            if (savedProfilePicture) {
                setProfilePicture(savedProfilePicture);
                setPreviewPicture(savedProfilePicture);
            }
        }
    }, [userId, setProfileValue]); const handleProfilePictureChange = (e) => {
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

    const onProfileSubmit = async (data) => {
        setLoading(true);
        try {
            // Save to localStorage with user-specific key
            if (typeof window !== 'undefined' && userId) {
                localStorage.setItem(`userProfile_${userId}`, JSON.stringify(data));
                localStorage.setItem(`profilePicture_${userId}`, previewPicture);
                localStorage.setItem(`userStatus_${userId}`, status);
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

    const onPasswordSubmit = async (data) => {
        try {
            setLoading(true);
            setMessage('');

            // Optional: verify current password by re-authenticating
            if (data.currentPassword) {
                const email = user?.email || profile.email;
                if (!email) {
                    setMessage('Missing email for re-authentication.');
                    return;
                }
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password: data.currentPassword,
                });
                if (signInError) {
                    setMessage('Current password is incorrect.');
                    return;
                }
            }

            const { error } = await supabase.auth.updateUser({ password: data.newPassword });
            if (error) {
                setMessage(error.message || 'Failed to update password.');
                return;
            }

            setMessage('Password updated successfully!');
            resetPassword();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error updating password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="relative h-52 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0")' }}>
                <div className="absolute inset-0 bg-linear-to-b from-black/40 to-black/20"></div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0  translate-y-1/2 w-full max-w-5xl px-6">
                    <div className="flex items-end gap-4">
                        <div className="relative pb-4 ">
                            <img
                                src={previewPicture}
                                alt=""
                                className="w-28 h-28 bg-teal-800 rounded-full border-4 border-white object-cover shadow-md"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-3 -right-1 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition"
                            >
                                <Camera className="w-5 h-5 text-teal-600" />
                            </button>
                        </div>
                        <div className="flex-1 pl-2 mt-12 pt-10 text-black">
                            <div className="flex items-center mt-4 gap-2">
                                <h1 className="text-2xl md:text-3xl text-black font-bold">{profile.firstName} {profile.lastName}</h1>
                                <VerifiedBadge className="w-6 h-6" />
                            </div>
                            <p className="text-sm md:text-base text-black opacity-90">{profile.email}</p>
                            <div className="mt-2 flex items-center gap-3">

                            </div>
                        </div>
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

            {/* Tabs + Content */}
            <div className="max-w-5xl mx-auto py-34 px-4 sm:px-6 lg:px-8 pb-8">
                <div className="bg-white shadow-lg rounded-xl">
                    <div className="border-b px-6 pt-4">
                        <div className="flex gap-6 ">
                            <button
                                className={`py-3 font-semibold ${activeTab === 'profile' ? 'text-teal-700 border-b-2 border-teal-700' : 'text-gray-600'}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                Profile
                            </button>
                            <button
                                className={`py-3 font-semibold ${activeTab === 'password' ? 'text-teal-700 border-b-2 border-teal-700' : 'text-gray-600'}`}
                                onClick={() => setActiveTab('password')}
                            >
                                Password
                            </button>
                        </div>
                    </div>
                    <div className="p-8">
                        {message && (
                            <div className={`${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} mb-6 p-4 rounded-lg`}>
                                {message}
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <form onSubmit={handleSubmitProfile(onProfileSubmit)}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>

                                <div className="grid text-black md:grid-cols-2 gap-6">
                                    <FormInput
                                        label="First Name"
                                        type="text"
                                        placeholder="Enter your first name"
                                        error={profileErrors.firstName?.message}
                                        {...registerProfile("firstName")}
                                    />
                                    <FormInput
                                        label="Last Name"
                                        type="text"
                                        placeholder="Enter your last name"
                                        error={profileErrors.lastName?.message}
                                        {...registerProfile("lastName")}
                                    />

                                    <FormInput
                                        label="Email"
                                        type="email"
                                        placeholder="Enter your email"
                                        error={profileErrors.email?.message}
                                        {...registerProfile("email")}
                                    />

                                    <FormInput
                                        label="Phone"
                                        type="text"
                                        placeholder="Enter your phone number"
                                        error={profileErrors.phone?.message}
                                        {...registerProfile("phone")}
                                    />

                                    <FormInput
                                        label="Role"
                                        type="text"
                                        placeholder="Enter your role"
                                        error={profileErrors.role?.message}
                                        {...registerProfile("role")}
                                    />

                                    <FormInput
                                        label="Department"
                                        type="text"
                                        placeholder="Enter your department"
                                        error={profileErrors.department?.message}
                                        {...registerProfile("department")}
                                    />

                                    <FormInput
                                        label="Location"
                                        type="text"
                                        placeholder="Enter your location"
                                        error={profileErrors.location?.message}
                                        {...registerProfile("location")}
                                    />

                                    <div className="md:col-span-2">
                                        <FormTextarea
                                            label="Bio"
                                            placeholder="Tell us about yourself"
                                            rows={3}
                                            error={profileErrors.bio?.message}
                                            {...registerProfile("bio")}
                                        />
                                    </div>

                                    <FormInput
                                        label="LinkedIn"
                                        type="text"
                                        placeholder="Enter your LinkedIn URL"
                                        error={profileErrors.linkedin?.message}
                                        {...registerProfile("linkedin")}
                                    />

                                    <FormInput
                                        label="GitHub"
                                        type="text"
                                        placeholder="Enter your GitHub URL"
                                        error={profileErrors.github?.message}
                                        {...registerProfile("github")}
                                    />
                                </div>

                                <div className="mt-6 flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg shadow-md hover:bg-gray-300 transition flex items-center gap-2"
                                    >
                                        <UploadIcon className="w-5 h-5" />
                                        Change Picture
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-3 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 transition disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'password' && (
                            <form onSubmit={handleSubmitPassword(onPasswordSubmit)}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>
                                <div className="space-y-6 text-black">
                                    <FormInput
                                        label="Current Password"
                                        type="password"
                                        placeholder="Enter current password"
                                        error={passwordErrors.currentPassword?.message}
                                        {...registerPassword("currentPassword")}
                                    />
                                    <FormInput
                                        label="New Password"
                                        type="password"
                                        placeholder="Enter new password"
                                        error={passwordErrors.newPassword?.message}
                                        {...registerPassword("newPassword")}
                                    />
                                    <FormInput
                                        label="Confirm New Password"
                                        type="password"
                                        placeholder="Confirm new password"
                                        error={passwordErrors.confirmPassword?.message}
                                        {...registerPassword("confirmPassword")}
                                    />
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading || isPasswordSubmitting}
                                        className="px-6 py-3 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 disabled:opacity-50"
                                    >
                                        {loading || isPasswordSubmitting ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
