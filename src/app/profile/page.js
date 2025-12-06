import React from 'react'
import Profile from '../pages/profile'
import DashboardWrapper from '@/components/auth/dashboardWrapper'

const page = () => {
  return (
    <DashboardWrapper>
      <Profile />
    </DashboardWrapper>
  )
}

export default page
