'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { FileText, Calendar, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

const MetricCard = ({ icon: Icon, title, value, change, isLoading }) => {
  const isPositive = change >= 0
  const changeColor = isPositive ? 'text-green-600' : 'text-red-500'

  return (
    <div className="
      p-3 sm:p-6
      border-2 border-gray-200
      rounded-xl
      bg-white
      shadow-sm
      flex flex-col
      transition duration-300 ease-in-out
      hover:border-teal-600
      hover:shadow-md
    ">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-500 mb-1">
            {title}
          </p>
          <p className="text-3xl  font-bold text-gray-800">
            {isLoading ? (
              <span className="text-gray-400">-</span>
            ) : (
              value
            )}
          </p>
        </div>

        <div className="
          w-10 h-10 p-2
          bg-indigo-50
          text-teal-600
          rounded-lg
          hidden md:flex items-center justify-center
        ">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <p className={`text-sm font-semibold ${changeColor}`}>
        {isLoading ? (
          <span className="text-gray-400">-</span>
        ) : (
          isPositive ? `+${change}%` : `${change}%`
        )}
      </p>
    </div>
  )
}

const DashboardMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalMeetings: 0,
    thisWeek: 0,
    completedCount: 0,
    withTranscripts: 0,
    todayCount: 0,
    weekChange: 0,
    completedRate: 0,
    totalChange: 0,
    todayChange: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const hasFetched = useRef(false)
  const user = useSelector(state => state.auth.user)

  useEffect(() => {
    if (hasFetched.current || !user) return
    hasFetched.current = true
    fetchMetrics()
  }, [user])

  const fetchMetrics = async () => {
    try {
      setIsLoading(true)

      if (!user) return

      // Single API call: Fetch all meetings for this user
      const { data: allMeetings, error } = await supabase
        .from('meetings')
        .select('id, status, created_at, transcript')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calculate all date ranges
      const today = new Date()
      const weekStart = new Date(today)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)

      const prevWeekStart = new Date(weekStart)
      prevWeekStart.setDate(prevWeekStart.getDate() - 7)

      const yesterdayStart = new Date(todayStart)
      yesterdayStart.setDate(yesterdayStart.getDate() - 1)
      const yesterdayEnd = new Date(todayStart)
      yesterdayEnd.setMilliseconds(-1)

      // Filter data client-side
      const completedMeetings = allMeetings.filter(m => m.status === 'completed')
      const withTranscriptsMeetings = allMeetings.filter(m => m.transcript && m.transcript.length > 0)

      const weekMeetings = allMeetings.filter(m => {
        const d = new Date(m.created_at)
        return d >= weekStart
      })

      const prevWeekMeetings = allMeetings.filter(m => {
        const d = new Date(m.created_at)
        return d >= prevWeekStart && d < weekStart
      })

      const todayMeetings = allMeetings.filter(m => {
        const d = new Date(m.created_at)
        return d >= todayStart && d <= todayEnd
      })

      const yesterdayMeetings = allMeetings.filter(m => {
        const d = new Date(m.created_at)
        return d >= yesterdayStart && d <= yesterdayEnd
      })

      // Calculate percentages and changes
      const completedRate = allMeetings.length > 0
        ? Math.round((completedMeetings.length / allMeetings.length) * 100)
        : 0

      let weekChange = 0
      if (prevWeekMeetings.length > 0) {
        weekChange = Math.round(((weekMeetings.length - prevWeekMeetings.length) / prevWeekMeetings.length) * 100)
      } else if (weekMeetings.length > 0) {
        weekChange = 100
      }

      let todayChange = 0
      if (yesterdayMeetings.length > 0) {
        todayChange = Math.round(((todayMeetings.length - yesterdayMeetings.length) / yesterdayMeetings.length) * 100)
      } else if (todayMeetings.length > 0) {
        todayChange = 100
      }

      setMetrics({
        totalMeetings: allMeetings?.length || 0,
        thisWeek: weekMeetings?.length || 0,
        completedCount: completedMeetings?.length || 0,
        withTranscripts: withTranscriptsMeetings?.length || 0,
        todayCount: todayMeetings?.length || 0,
        weekChange: weekChange || 0,
        completedRate: completedRate || 0,
        totalChange: allMeetings && allMeetings.length > 0 ? 100 : 0,
        todayChange: todayChange || 0,
      })
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const metricCards = [
    {
      id: 1,
      icon: FileText,
      title: 'Total Meetings',
      value: metrics.totalMeetings,
      change: metrics.totalChange || 0,
    },
    {
      id: 2,
      icon: Calendar,
      title: 'This Week',
      value: metrics.thisWeek,
      change: metrics.weekChange,
    },
    {
      id: 4,
      icon: Clock,
      title: 'Today',
      value: metrics.todayCount,
      change: metrics.todayChange,
    },
    {
      id: 3,
      icon: CheckCircle,
      title: 'Completed',
      value: metrics.completedCount,
      change: metrics.completedRate,
    },

  ]

  return (
    <div className="py-8 bg-gray-50">
      <div className="max-w-7xl w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl sm:text-2xl lg:3xl font-bold text-gray-900 mb-8">
          Dashboard Overview
        </h1>
        <div className="
          grid grid-cols-2
          gap-4
          md:grid-cols-4
          md:gap-6
          lg:gap-8
        ">
          {metricCards.map((metric) => (
            <MetricCard
              key={metric.id}
              icon={metric.icon}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardMetrics;