'use client';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react'
import { Edit, Users } from 'lucide-react'
import { FaSpinner } from "react-icons/fa6";

const MeetingDetailsPage = ({ meetingId }) => {
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('summary');
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState('');
    const messagesEndRef = useRef(null);
    const router = useRouter();

    const fetchMeetingDetails = async (meetingId) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('meetings')
                .select('*')
                .eq('id', meetingId)
                .single();
            if (error) {
                throw error;
            }
            setData(data);
            console.log('Meeting Details:', data);
            return data;
        }
        catch (error) {
            console.error('Error fetching meeting details:', error);
            return null;
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (meetingId) {
            fetchMeetingDetails(meetingId);
        }
    }, [meetingId]);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    }, [messages, isTyping]);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-5 py-5 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-lg text-gray-600">
                    <FaSpinner className='w-8 h-8 animate-spin text-teal-600' />

                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="max-w-6xl mx-auto px-5 py-5 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-lg text-red-600">Failed to load meeting details</div>
            </div>
        );
    }

    const getVideoUrl = () => {
        if (data.file_path) {
            const bucket = 'ai_meetings';
            return supabase.storage.from(bucket).getPublicUrl(data.file_path).data.publicUrl;
        }
        return null;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Update helper for meeting fields
    const updateMeeting = async (id, updates) => {
        try {
            const { data: updated, error } = await supabase
                .from('meetings')
                .update(updates)
                .eq('id', id)
                .select('*')
                .single();
            if (error) throw error;
            return { success: true, data: updated };
        } catch (err) {
            console.error('updateMeeting error:', err);
            return { success: false, error: err.message || String(err) };
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        const question = inputValue;
        setInputValue('');
        setIsTyping(true);

        const prompt = `You are an expert meeting assistant. Answer questions using only the provided meeting context. If information is missing, say so and suggest next steps. Be concise and actionable.\n\n` +
            `Meeting Metadata: Title: ${data.title || 'Untitled'}; Date: ${data.created_at || ''}; Status: ${data.status || ''}; File: ${data.file_name || ''} (${data.file_type || ''}, ${data.file_size || ''}).\n` +
            `Participants: ${(Array.isArray(data.participants) && data.participants.length > 0) ? data.participants.map(p => `${p.name}${p.email ? ' — ' + p.email : ''}`).join('; ') : 'No participants recorded.'}\n` +
            `Summary: """${data.summary || ''}"""\n` +
            `Key Points: ${JSON.stringify(Array.isArray(data.key_points) ? data.key_points : [])}\n` +
            `Action Items: ${JSON.stringify(Array.isArray(data.action_items) ? data.action_items : [])}\n` +
            `Transcript (full): """${data.transcript || ''}"""\n\n` +
            `User Question: """${question}"""\n\n` +
            `Instructions: Ground answers in transcript and summary. Use bullets. Bold labels like Decision:. Keep under 8–12 lines unless asked. Do not invent facts.`

        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

        try {
            if (!apiKey) throw new Error('Missing NEXT_PUBLIC_GEMINI_API_KEY')

            console.log('[AI Chat] Sending prompt to Gemini...', {
                meetingId: data.id,
                hasTranscript: Boolean(data.transcript && data.transcript.length > 0),
                promptChars: prompt.length
            })

            // Use a stable, supported model name for v1beta
            const base = 'https://generativelanguage.googleapis.com/v1beta/models/'
            // Align with edge function usage: gemini-2.0-flash
            const modelFlash = base + 'gemini-2.0-flash:generateContent?key=' + apiKey
            const modelPro = base + 'gemini-2.0-pro:generateContent?key=' + apiKey

            let res = await fetch(modelFlash, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: prompt }]
                        }
                    ]
                })
            })
            // If flash is not found, retry with pro once
            if (res.status === 404) {
                console.warn('[AI Chat] flash model 404; retrying with pro')
                res = await fetch(modelPro, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            {
                                role: 'user',
                                parts: [{ text: prompt }]
                            }
                        ]
                    })
                })
            }

            if (!res.ok) {
                const errText = await res.text()
                throw new Error(errText || `Failed to get AI response (status ${res.status})`)
            }
            const payload = await res.json()
            console.log('[AI Chat] Gemini response received', payload)
            const answer = payload?.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer generated.'

            const aiMessage = {
                id: Date.now() + 1,
                text: answer,
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('AI chat error:', error)
            const friendly = !apiKey
                ? 'Missing API key. Please set NEXT_PUBLIC_GEMINI_API_KEY in .env.local and restart.'
                : 'Sorry, I could not process that right now. Please try again shortly.'
            const aiMessage = {
                id: Date.now() + 1,
                text: friendly,
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
        } finally {
            setIsTyping(false);
        }
    };


    const startEditName = () => {
        setTempName(data.meeting_name || '');
        setIsEditingName(true);
    };

    const cancelEditName = () => {
        setIsEditingName(false);
        setTempName('');
    };

    const saveEditName = async () => {
        const newName = (tempName || '').trim();
        if (!newName || newName === data.meeting_name) {
            setIsEditingName(false);
            return;
        }
        const res = await updateMeeting(data.id, { meeting_name: newName });
        if (res.success) {
            setData(prev => ({ ...prev, meeting_name: res.data.meeting_name }));
            setIsEditingName(false);
        } else {
            // Silent failure: keep editing UI, optional console
            console.error('Failed to update meeting name:', res.error);
        }
    };

    return (
        <div className="max-w-7xl md:w-[92%] w-[97%] mx-auto px-5 py-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className=" py-4 mb-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                        {isEditingName ? (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                                <input
                                    type="text"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    className="flex-1 md:text-4xl text-xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-teal-600 px-2 py-1"
                                />
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={saveEditName}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 whitespace-nowrap"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={cancelEditName}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-300 whitespace-nowrap"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="md:text-4xl text-xl font-bold text-black break-words">{data.meeting_name}</h1>
                                <button
                                    onClick={startEditName}
                                    aria-label="Edit meeting name"
                                    title="Edit meeting name"
                                    className="p-2 rounded-md border border-gray-200 text-teal-700 hover:bg-teal-100 hover:text-teal-900 shrink-0"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-6 mt-3">
                        <span className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="font-semibold text-gray-900">Uploaded:</span>
                            {formatDate(data.created_at)}
                        </span>
                        <span className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="font-semibold text-gray-900">File Size:</span>
                            {formatFileSize(data.file_size)}
                        </span>
                        <span className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="font-semibold text-gray-900">Status:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadgeColor(data.status)}`}>
                                {data.status}
                            </span>
                        </span>

                    </div>
                </div>
            </div>

            {/* Video Preview */}
            <div className="  mb-10 overflow-hidden">
                <div className="w-full bg-black rounded-lg overflow-hidden">
                    {getVideoUrl() ? (
                        <video
                            controls
                            controlsList="nodownload"
                            className="w-full h-[500px] aspect-video"
                        >
                            <source src={getVideoUrl()} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <div className="w-full aspect-video bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <p className="text-white text-lg font-semibold">Video not available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="flex border-b-2 border-gray-200 ">
                    <button
                        className={`flex-1 cursor-pointer px-5 py-4 font-semibold text-sm transition-all ${activeTab === 'summary'
                            ? 'text-teal-600 border-b-4 border-teal-600 -mb-0.5'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        onClick={() => setActiveTab('summary')}
                    >
                        Summary
                    </button>
                    <button
                        className={`flex-1 cursor-pointer px-5 py-4 font-semibold text-sm transition-all ${activeTab === 'transcript'
                            ? 'text-teal-600 border-b-4 border-teal-600 -mb-0.5'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        onClick={() => setActiveTab('transcript')}
                    >
                        Transcript
                    </button>
                    <button
                        className={`flex-1 cursor-pointer px-5 py-4 font-semibold text-sm transition-all ${activeTab === 'qaTab'
                            ? 'text-teal-600 border-b-4 border-teal-600 -mb-0.5'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        onClick={() => setActiveTab('qaTab')}
                    >
                        AI Q&A
                    </button>
                </div>

                {/* Tab Content */}
                <div className="md:p-8 p-4">
                    {/* Summary Tab */}
                    {activeTab === 'summary' && (
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col gap-3">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">📋 Meeting Summary</h3>
                                <p className="text-sm leading-relaxed text-gray-700">{data.summary}</p>
                            </div>

                            {/* Key Points */}
                            {data.key_points && data.key_points.length > 0 && (
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-lg font-bold text-gray-900">📌 Key Points</h3>
                                    <ul className="flex flex-col gap-3">
                                        {data.key_points.map((point, index) => (
                                            <li key={index} className="flex gap-3 p-3 bg-teal-50 rounded-lg ">
                                                <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold shrink-0">
                                                    {index + 1}
                                                </span>
                                                <span className="text-sm leading-relaxed text-gray-900">{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Action Items */}
                            {data.action_items && data.action_items.length > 0 && (
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-lg font-bold text-gray-900">✓ Action Items</h3>
                                    <ul className="flex flex-col gap-3">
                                        {data.action_items.map((item, index) => (
                                            <li key={index} className="flex gap-3 p-3 bg-yellow-50 rounded-lg">

                                                <span className="text-sm leading-relaxed text-gray-900">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Participants List */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <Users className="w-6 h-6 text-teal-600" />
                                    <h3 className="text-lg font-bold text-gray-900"> Participants</h3>
                                </div>
                                {Array.isArray(data.participants) && data.participants.length > 0 ? (
                                    <ul className="flex flex-col gap-2">
                                        {data.participants.map((p, i) => (
                                            <li key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                    {String(p.name || '').charAt(0).toUpperCase() || 'P'}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                                                    {/* {p.email && (
                                                        // <p className="text-xs text-gray-600">{p.email}</p>
                                                    )} */}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-600">No participants recorded.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Transcript Tab */}
                    {activeTab === 'transcript' && (
                        <div className="flex flex-col gap-4">
                            <div className="">
                                <p className="text-md leading-relaxed text-gray-800 whitespace-pre-wrap">{data.transcript}</p>
                            </div>
                        </div>
                    )}

                    {/* AI Q&A Tab */}
                    {activeTab === 'qaTab' && (
                        <div className="flex flex-col gap-4 h-[600px]">
                            {/* Chat Messages Container */}
                            <div className="flex-1 overflow-y-auto  rounded-lg p-4 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center flex flex-col gap-3">
                                            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                                                <span className="text-2xl">💬</span>
                                            </div>
                                            <p className="text-lg font-semibold text-gray-700">Ask a Question</p>
                                            <p className="text-sm text-gray-500 max-w-xs">Ask questions about this meeting and get AI-powered answers based on the transcript and analysis</p>
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {message.sender === 'ai' && (
                                                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                                                    AI
                                                </div>
                                            )}
                                            <div
                                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'user'
                                                    ? 'bg-teal-600 text-white rounded-br-none'
                                                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                                                    }`}
                                            >
                                                <p className="text-sm leading-relaxed">{message.text}</p>
                                                <span className={`text-xs mt-1 block ${message.sender === 'user' ? 'text-teal-100' : 'text-gray-500'}`}>
                                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {message.sender === 'user' && (
                                                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-sm font-bold shrink-0">
                                                    A
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                                {isTyping && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                                            AI
                                        </div>
                                        <div className="bg-white text-gray-900 border border-gray-200 rounded-lg rounded-bl-none px-4 py-2 flex gap-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask a question about this meeting..."
                                    className="flex-1 px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <span>Send</span>
                                    <span>→</span>
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 flex gap-4 justify-center pb-8">
                <button
                    onClick={() => router.push('/upload')}
                    className="md:px-6 px-4 py-4 md:py-3 text-sm md:text-lg bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center gap-2"
                >
                    Upload Another File
                </button>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="md:px-6 px-4 py-4 md:py-3 text-sm md:text-lg bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
                >
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    )
}

export default MeetingDetailsPage
