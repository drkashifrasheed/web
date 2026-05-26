'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import VideoCallRoom from '@/components/video/VideoCallRoom'
import { bookingApi, authApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { requestNotificationPermission } from '@/lib/browserNotify'

export default function VideoCallBookingPage() {
  const params = useParams()
  const bookingId = params.bookingId as string
  const router = useRouter()
  const { user, token } = useAuthStore()
  const [remote, setRemote] = useState<{ id: string; name: string } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  useEffect(() => {
    if (!token) {
      router.replace('/login')
      return
    }

    const load = async () => {
      try {
        const res = await bookingApi.getBooking(bookingId)
        const b = res.data.data.booking

        const callStatus = b.videoCallStatus || 'none'
        if (!['accepted', 'active', 'requested'].includes(callStatus)) {
          setError('No active video call for this booking')
          return
        }

        if (user?.role === 'admin' || user?.role === 'doctor') {
          const patient = typeof b.patient === 'object' ? b.patient : null
          setRemote({
            id: patient?._id || String(b.patient),
            name: patient?.fullName || b.patientInfo?.fullName || 'Patient'
          })
        } else {
          if (b.videoCallStatus === 'requested') {
            await bookingApi.acceptVideoCall(bookingId)
          }
          const adminRes = await authApi.getAdminContact()
          const admin = adminRes.data.data.admin
          setRemote({
            id: admin._id,
            name: admin.fullName || 'Dr. Mahar Kashif Rasheed'
          })
        }
      } catch {
        setError('Could not load video session')
      }
    }

    load()
  }, [bookingId, token, user, router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6 text-center">
        <div>
          <p className="mb-4">{error}</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-500 rounded-xl"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  if (!remote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b141a]">
        <Loader2 className="w-10 h-10 animate-spin text-[#25d366]" />
      </div>
    )
  }

  return (
    <VideoCallRoom
      bookingId={bookingId}
      remoteUserId={remote.id}
      remoteUserName={remote.name}
    />
  )
}
