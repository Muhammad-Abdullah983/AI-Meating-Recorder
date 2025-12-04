import VerifyForm from '@/components/auth/verify/page'
import AuthWrapper from '@/components/auth/authWrapper'
import React, { Suspense } from 'react'

const VerifyPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading…</div>}>
      <VerifyForm />
    </Suspense>
  )
}

export default VerifyPage
