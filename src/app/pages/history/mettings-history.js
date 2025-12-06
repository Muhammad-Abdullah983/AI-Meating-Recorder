'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Trash2, Eye, Loader, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { triggerTranscriptionProcessing } from '@/services/api/transcriptionService'
import toast from 'react-hot-toast'


const MeetingHistory = () => {
    const router = useRouter()
    const [meetings, setMeetings] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [retryingId, setRetryingId] = useState(null)
    const [selectedIds, setSelectedIds] = useState([])
    const [selectionMode, setSelectionMode] = useState(false)

    useEffect(() => {
        fetchMeetings()
    }, [])

    const fetchMeetings = async () => {
        try {
            setIsLoading(true)

            // Get user session
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch all meetings for this user
            const { data: meetingsData, error } = await supabase
                .from('meetings')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            setMeetings(meetingsData || [])
        } catch (error) {
            console.error('Error fetching meetings:', error)
            toast.error('Failed to load meetings. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A'
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'processing':
                return 'bg-blue-100 text-blue-800'
            case 'failed':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const handleDeleteMeeting = async (meetingId) => {
        try {
            const { error } = await supabase
                .from('meetings')
                .delete()
                .eq('id', meetingId)

            if (error) throw error

            setMeetings(meetings.filter(m => m.id !== meetingId))
            setDeleteConfirm(null)
            toast.success('Meeting deleted successfully!')
        } catch (error) {
            console.error('Error deleting meeting:', error)
            toast.error('Failed to delete meeting. Please try again.')
        }
    }

    const handleDeleteSelected = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            if (selectedIds.length === 0) return

            const { error } = await supabase
                .from('meetings')
                .delete()
                .in('id', selectedIds)

            if (error) throw error

            setMeetings(meetings.filter(m => !selectedIds.includes(m.id)))
            setSelectedIds([])
            setDeleteConfirm(null)
            toast.success(`${selectedIds.length} meeting(s) deleted successfully!`)
        } catch (error) {
            console.error('Error deleting selected meetings:', error)
            toast.error('Failed to delete meetings. Please try again.')
        }
    }

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    const exitSelectionMode = () => {
        setSelectionMode(false)
        setSelectedIds([])
    }

    const handleRetryTranscription = async (meeting) => {
        try {
            setRetryingId(meeting.id)
            console.log('Retrying transcription for meeting:', meeting.id)

            const result = await triggerTranscriptionProcessing({
                filePath: meeting.file_path,
                fileType: meeting.file_type,
                fileName: meeting.file_name,
                userId: meeting.user_id,
                meetingId: meeting.id,
            })

            if (result.success) {
                toast.success('Transcription retry initiated! Processing will start shortly.');
                // Update meeting status to processing
                setMeetings(meetings.map(m =>
                    m.id === meeting.id ? { ...m, status: 'processing' } : m
                ))
            } else {
                toast.error(`Retry failed: ${result.error}. Please try again later.`);
            }
        } catch (error) {
            console.error('Error retrying transcription:', error)
            toast.error('Error retrying transcription. Please try again.');
        } finally {
            setRetryingId(null)
        }
    }



    return (
        <div className="py-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
                            Meeting History
                        </h1>
                        <p className="text-gray-600 hidden sm:block">
                            View all your uploaded meetings and their transcriptions
                        </p>
                    </div>
                    {meetings.length > 0 && (
                        <div className="flex items-center gap-3">
                            {!selectionMode && (
                                <button
                                    onClick={() => setSelectionMode(true)}
                                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-700 transition font-semibold"
                                    title="Enable selection"
                                >
                                    Select
                                </button>
                            )}
                            {selectionMode && (
                                <>
                                    <button
                                        onClick={() => setDeleteConfirm('selected')}
                                        disabled={selectedIds.length === 0}
                                        className={`px-2 py-0 md:py-2 rounded-lg transition font-medium flex items-center gap-2 ${selectedIds.length === 0 ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-700'}`}
                                        title="Delete selected meetings"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Selected
                                    </button>
                                    <button
                                        onClick={exitSelectionMode}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                                        title="Exit selection"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : meetings.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No meetings uploaded yet</p>
                        <p className="text-gray-500 text-sm">Upload your first meeting to get started</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-x-auto  overflow-y-auto">
                        <table className="w-full">
                            <thead className="bg-gray-200 border-b border-gray-200">
                                <tr>
                                    {selectionMode && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-12"></th>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Size
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Uploaded
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {meetings.map((meeting) => (
                                    <tr
                                        key={meeting.id}
                                        onClick={() => router.push(`/details/${meeting.id}`)}
                                        className="hover:bg-teal-100 transition cursor-pointer"
                                    >
                                        {selectionMode && (
                                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(meeting.id)}
                                                    onChange={() => toggleSelect(meeting.id)}
                                                />
                                            </td>
                                        )}
                                        <td className="px-6 py-2 md:py-4 text-sm font-medium text-gray-900">
                                            {meeting.meeting_name}
                                        </td>
                                        <td className="px-6 py-2 md:py-4 text-sm text-gray-600 capitalize">
                                            {meeting.file_type}
                                        </td>
                                        <td className="px-6 py-2 md:py-4 text-sm text-gray-600">
                                            {formatFileSize(meeting.file_size)}
                                        </td>
                                        <td className="px-6 py-2 md:py-4 text-sm">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                                                {meeting.status?.charAt(0).toUpperCase() + meeting.status?.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 md:py-4 text-sm text-gray-600">
                                            {formatDate(meeting.created_at)}
                                        </td>
                                        <td className="px-6 py-2 md:py-4 text-sm space-x-2 flex" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => router.push(`/details/${meeting.id}`)}
                                                className="text-indigo-600 hover:text-indigo-900 transition p-2 hover:bg-indigo-50 rounded"
                                                title="View Details"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            {!meeting.transcript && meeting.file_path && (
                                                <button
                                                    onClick={() => handleRetryTranscription(meeting)}
                                                    disabled={retryingId === meeting.id}
                                                    className="text-orange-600 hover:text-orange-900 transition p-2 hover:bg-orange-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Retry Transcription"
                                                >
                                                    {retryingId === meeting.id ? (
                                                        <Loader className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="w-5 h-5" />
                                                    )}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setDeleteConfirm(meeting.id)}
                                                className="text-red-500 hover:text-red-900 transition p-2 hover:bg-red-50 rounded"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {deleteConfirm === 'selected' ? 'Delete Selected Meetings?' : 'Delete Meeting?'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {deleteConfirm === 'selected'
                                ? `Are you sure you want to delete ${selectedIds.length} selected meeting(s)? This action cannot be undone.`
                                : 'Are you sure you want to delete this meeting? This action cannot be undone.'}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (deleteConfirm === 'selected') {
                                        handleDeleteSelected()
                                    } else {
                                        handleDeleteMeeting(deleteConfirm)
                                    }
                                }}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

            )}
            <div className="mt-8 sm:w-[100%] w-[88%] mx-auto flex gap-2 md:gap-4 justify-center pb-8">
                <button
                    onClick={() => router.push('/upload')}
                    className="md:px-6 px-1 py-1 md:py-3 text-sm bg-teal-600 md:text-lg text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center gap-2"
                >
                    Upload Another File
                </button>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="md:px-6 px-1 py-1 md:py-3 bg-gray-600 text-sm  md:text-lg text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
                >
                    ← Back to Dashboard
                </button>
            </div>
        </div>

    )
}

export default MeetingHistory
