'use client';
import MeetingDetailsPage from '@/app/pages/dashboard/details/meeting-details';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';
import React, { use, useEffect } from 'react'

const page = () => {
    const { id } = useParams();
    console.log('Meeting ID:', id);
  
  return (
    <div>
      <MeetingDetailsPage meetingId={id} />
   
    </div>
  )
}

export default page
