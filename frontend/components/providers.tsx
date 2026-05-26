'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import NotificationListener from '@/components/NotificationListener'

export function Providers({ children }: { children: React.ReactNode }) {
  const loadUser = useAuthStore((state) => state.loadUser)

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return (
    <>
      <NotificationListener />
      {children}
    </>
  )
}