'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { FileText, Trash2, Eye, Loader } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'
import { FaSpinner } from "react-icons/fa6";



const MeetingHistory = () => {
    const router = useRouter()
    const [meetings, setMeetings] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [selectedIds, setSelectedIds] = useState([])
    const [hasMore, setHasMore] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const observerTarget = useRef(null)
    const hasFetched = useRef(false)
    const user = useSelector(state => state.auth.user)
    const LIMIT = 10

    useEffect(() => {
        if (hasFetched.current || !user) return
        hasFetched.current = true

        setMeetings([])
        setHasMore(true)
        fetchMeetings(0)
    }, [user])

    // Set up intersection observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
                    loadMore()
                }
            },
            { threshold: 0.01, rootMargin: '100px' }
        )

        if (observerTarget.current) {
            observer.observe(observerTarget.current)
        }

        return () => observer.disconnect()
    }, [hasMore, isLoadingMore, isLoading])

    const fetchMeetings = async (offset) => {
        try {
            if (offset === 0) setIsLoading(true)
            else setIsLoadingMore(true)

            if (!user) {
                setIsLoading(false)
                return
            }

            // Fetch meetings with pagination
            const { data: meetingsData, error, count } = await supabase
                .from('meetings')
                .select('*', { count: 'exact' })
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .range(offset, offset + LIMIT - 1)

            if (error) throw error

            setTotalCount(count || 0)

            // Append or replace meetings based on offset
            if (offset === 0) {
                setMeetings(meetingsData || [])
            } else {
                setMeetings(prev => [...prev, ...(meetingsData || [])])
            }

            // Check if there are more meetings to load
            const loadedTotal = offset + LIMIT
            setHasMore(loadedTotal < (count || 0))
        } catch (error) {
            console.error('Error fetching meetings:', error)
            toast.error('Failed to load meetings. Please try again.')
        } finally {
            setIsLoading(false)
            setIsLoadingMore(false)
        }
    }

    const loadMore = () => {
        if (isLoadingMore || !hasMore) return
        const newOffset = meetings.length
        fetchMeetings(newOffset)
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
            if (!user || selectedIds.length === 0) return

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

    const toggleSelectAll = () => {
        if (selectedIds.length === meetings.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(meetings.map(m => m.id))
        }
    }


    return (
        <div className="py-4 bg-gray-50 min-h-screen">
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
                    {meetings.length > 0 && selectedIds.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 font-medium">
                                {selectedIds.length} selected
                            </span>
                            <button
                                onClick={() => setDeleteConfirm('selected')}
                                className="px-4 py-2 bg-red-500 cursor-pointer text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2"
                                title="Delete selected meetings"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Selected
                            </button>
                            <button
                                onClick={() => setSelectedIds([])}
                                className="px-4 py-2 bg-gray-200 cursor-pointer text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                                title="Clear selection"
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </div>

                {isLoading && meetings.length === 0 ? (
                    <div className="flex justify-center items-center py-12">
                        <FaSpinner className='w-8 h-8 animate-spin text-teal-600' />

                    </div>
                ) : meetings.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No meetings uploaded yet</p>
                        <p className="text-gray-500 text-sm">Upload your first meeting to get started</p>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="bg-white rounded-lg shadow overflow-x-auto max-h-[400px] overflow-y-auto">
                            <table className="w-full">
                                <thead className="bg-gray-200 border-b border-gray-200 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-16">
                                            <input
                                                type="checkbox"
                                                checked={meetings.length > 0 && selectedIds.length === meetings.length}
                                                onChange={toggleSelectAll}
                                                className="cursor-pointer w-4 h-4"
                                                title="Select all"
                                            />
                                        </th>
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
                                            className="hover:bg-gray-50 transition"
                                        >
                                            <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(meeting.id)}
                                                    onChange={() => toggleSelect(meeting.id)}
                                                    className="cursor-pointer w-4 h-4"
                                                />
                                            </td>
                                            <td
                                                className="px-6 py-2 md:py-4 text-sm font-medium text-gray-900 cursor-pointer"
                                                onClick={() => router.push(`/details/${meeting.id}`)}
                                            >
                                                {meeting.meeting_name}
                                            </td>
                                            <td
                                                className="px-6 py-2 md:py-4 text-sm text-gray-600 capitalize cursor-pointer"
                                                onClick={() => router.push(`/details/${meeting.id}`)}
                                            >
                                                {meeting.file_type}
                                            </td>
                                            <td
                                                className="px-6 py-2 md:py-4 text-sm text-gray-600 cursor-pointer"
                                                onClick={() => router.push(`/details/${meeting.id}`)}
                                            >
                                                {formatFileSize(meeting.file_size)}
                                            </td>
                                            <td
                                                className="px-6 py-2 md:py-4 text-sm cursor-pointer"
                                                onClick={() => router.push(`/details/${meeting.id}`)}
                                            >
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                                                    {meeting.status?.charAt(0).toUpperCase() + meeting.status?.slice(1)}
                                                </span>
                                            </td>
                                            <td
                                                className="px-6 py-2 md:py-4 text-sm text-gray-600 cursor-pointer"
                                                onClick={() => router.push(`/details/${meeting.id}`)}
                                            >
                                                {formatDate(meeting.created_at)}
                                            </td>
                                            <td className="px-6 py-2 md:py-4 text-sm space-x-2 flex" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => router.push(`/details/${meeting.id}`)}
                                                    className="text-indigo-600 hover:text-indigo-900 transition p-2  rounded"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5 cursor-pointer" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(meeting.id)}
                                                    className="text-red-500 hover:text-red-900 transition p-2 hover:bg-red-50 rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5 cursor-pointer" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Intersection Observer Target - Triggers loading more */}
                            {hasMore && (
                                <div
                                    ref={observerTarget}
                                    className="w-full py-4 flex justify-center items-center bg-white"
                                >
                                    {isLoadingMore && (
                                        <FaSpinner className='w-6 h-6 animate-spin text-teal-600' />
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-3 bg-white border-t border-gray-200 rounded-b-lg">
                            <p className="text-base text-gray-700">
                                Showing <span className="font-semibold">{meetings.length}</span> out of <span className="font-semibold">{totalCount}</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[2px]">
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
                                className="flex-1 px-4 py-2 bg-gray-300 cursor-pointer text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
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
                                className="flex-1 px-4 py-2 bg-red-600 text-white cursor-pointer rounded-lg hover:bg-red-700 transition font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

            )}

        </div>

    )
}

export default MeetingHistory
