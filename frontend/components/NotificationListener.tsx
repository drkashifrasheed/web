'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getSocket } from '@/lib/socket'
import { requestNotificationPermission, showBrowserNotification } from '@/lib/browserNotify'

export default function NotificationListener() {
  const { token, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!token || !isAuthenticated) return

    requestNotificationPermission()
    const socket = getSocket()

    const onNotify = (payload: {
      notification?: { title: string; message: string }
    }) => {
      if (payload?.notification) {
        showBrowserNotification(payload.notification.title, {
          body: payload.notification.message
        })
      }
    }

    socket.on('new_notification', onNotify)
    socket.on('notification_message', onNotify)
    socket.on('appointment_time', (data: { bookingId: string }) => {
      showBrowserNotification('Appointment time', {
        body: 'Your consultation time has started. Open the app to join.'
      })
    })

    return () => {
      socket.off('new_notification', onNotify)
      socket.off('notification_message', onNotify)
      socket.off('appointment_time')
    }
  }, [token, isAuthenticated])

  return null
}
