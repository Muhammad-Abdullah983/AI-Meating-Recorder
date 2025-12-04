'use client'

import React, { useState } from 'react'
import DashboardMetrics from './stats-card'
import SearchAndUploadBar from './searchbar'
import MeetingCards from './meeting-cards'

const index = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  return (
    <div>
      <DashboardMetrics />
      <SearchAndUploadBar onSearch={handleSearch} />
      <MeetingCards searchQuery={searchQuery} />
    </div>
  )
}

export default index;
