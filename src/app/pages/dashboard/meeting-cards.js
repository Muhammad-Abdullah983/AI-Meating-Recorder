'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, AlertCircle, Loader, FileVideo, Calendar, Users } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

const MeetingCards = ({ searchQuery = '' }) => {
    const router = useRouter()
    const [meetings, setMeetings] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [hoveredCard, setHoveredCard] = useState(null)

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
        } finally {
            setIsLoading(false)
        }
    }

    // Filter meetings based on search query
    const filteredMeetings = meetings.filter((meeting) => {
        const query = searchQuery.toLowerCase()

        // Search in title
        if (meeting.meeting_name?.toLowerCase().includes(query)) return true

        // Search in description
        if (meeting.description?.toLowerCase().includes(query)) return true

        // Search in tags
        if (meeting.tags?.some(tag => tag.toLowerCase().includes(query))) return true

        return false
    })

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            case 'processing':
                return <Loader className="w-5 h-5 text-blue-600 animate-spin" />
            case 'failed':
                return <AlertCircle className="w-5 h-5 text-red-600" />
            default:
                return <FileVideo className="w-5 h-5 text-gray-600" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-white border-emerald-200'
            case 'processing':
                return 'bg-blue-50 border-blue-200'
            case 'failed':
                return 'bg-red-50 border-red-200'
            default:
                return 'bg-gray-50 border-gray-200'
        }
    }

    if (isLoading) {
        return (
            <div className="w-full py-12 flex justify-center items-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Loading meetings...</p>
                </div>
            </div>
        )
    }

    if (meetings.length === 0) {
        return (
            <div className="w-full py-12 flex justify-center items-center">
                <div className="text-center">
                    <FileVideo className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No meetings yet</p>
                    <p className="text-gray-500 text-sm">Upload your first meeting to get started</p>
                </div>
            </div>
        )
    }

    if (filteredMeetings.length === 0 && searchQuery !== '') {
        return (
            <div className="w-full py-12 flex justify-center items-center">
                <div className="text-center">
                    <FileVideo className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No meetings found</p>
                    <p className="text-gray-500 text-sm">Try different search terms</p>
                </div>
            </div>
        )
    }

    return (
        <div className="sm:w-[90%] w-[87%] max-w-7xl mx-auto my-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredMeetings.map((meeting) => (
                    <div
                        key={meeting.id}
                        onMouseEnter={() => setHoveredCard(meeting.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                        onClick={() => router.push(`/details/${meeting.id}`)}
                        className={`group rounded-xl border-2 transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-100 hover:shadow-2xl ${getStatusColor(meeting.status)}`}
                    >
                        {/* Card Content */}
                        <div className="p-6">
                            {/* Status Badge and Title */}
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors flex-1">
                                    {meeting.meeting_name}
                                </h3>
                                <div className="p-2 bg-white rounded-full  ml-2">
                                    {getStatusIcon(meeting.status)}
                                </div>
                            </div>

                            {/* Tags */}
                            {meeting.tags && meeting.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {meeting.tags.slice(0, 2).map((tag, idx) => (
                                        <span key={idx} className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Description */}
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {meeting.description || 'No description available'}
                            </p>

                            {/* Meta Info */}
                            <div className="space-y-2 mb-4 text-xs text-gray-700">

                                {Array.isArray(meeting.participants) && meeting.participants.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-500" />
                                        <span>{meeting.participants.length} Participants</span>
                                    </div>
                                )}
                            </div>

                            {/* Summary Snippet */}
                            {meeting.summary && (
                                <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                                    <p className="text-xs font-semibold text-gray-700 mb-2">📝 Summary</p>
                                    <p className="text-xs text-gray-600 line-clamp-3">
                                        {meeting.summary}
                                    </p>
                                </div>
                            )}

                            {/* Action Items Count */}
                            {meeting.action_items && meeting.action_items.length > 0 && (
                                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
                                    <span className="text-xs font-semibold text-yellow-800">
                                        📋 {meeting.action_items.length} Action Items
                                    </span>
                                    <span className="text-xs text-yellow-700 font-bold">
                                        →
                                    </span>
                                </div>
                            )}

                            {/* View Details Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/details/${meeting.id}`)
                                }}
                                className="w-full py-2.5 px-4 bg-teal-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all hover:cursor-pointer duration-300 transform hover:shadow-lg"
                            >
                                View Details →
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MeetingCards
