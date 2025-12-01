import React from 'react'
import UploadPage from '@/app/pages/upload'
import DashboardWrapper from '@/components/auth/dashboardWrapper'

const page = () => {
    return (
        <DashboardWrapper>
            <UploadPage />
        </DashboardWrapper>
    )
}

export default page
