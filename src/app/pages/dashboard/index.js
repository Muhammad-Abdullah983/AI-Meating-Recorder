import React from 'react'
import DashboardMetrics from './stats-card'
import SearchAndUploadBar from './searchbar'

const index = () => {
  return (
    <div>
      <DashboardMetrics />
      
      <SearchAndUploadBar />
    </div>
  )
}

export default index;
