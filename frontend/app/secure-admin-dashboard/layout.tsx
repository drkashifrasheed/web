'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function AdminDashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoading, loadUser } = useAuthStore()
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking')

  useEffect(() => {
    // Wait for store to be hydrated from localStorage
    const checkAuth = async () => {
      // Give more time for everything to settle
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Check localStorage directly for token
      const localToken = localStorage.getItem('token')
      console.log('Dashboard layout - Token from localStorage:', localToken ? 'exists' : 'missing')
      
      if (!localToken) {
        // No token, not authenticated
        console.log('Dashboard layout - No token found')
        setAuthState('unauthenticated')
        return
      }
      
      // We have a token, now check if we have user data
      let currentUser = user
      
      if (!currentUser) {
        console.log('Dashboard layout - Have token but no user, loading...')
        try {
          await loadUser()
          // Wait for state update
          await new Promise(resolve => setTimeout(resolve, 200))
          currentUser = useAuthStore.getState().user
          console.log('Dashboard layout - User loaded:', currentUser)
        } catch (error) {
          console.log('Dashboard layout - Failed to load user')
          setAuthState('unauthenticated')
          return
        }
      }
      
      if (currentUser && currentUser.role === 'admin') {
        console.log('Dashboard layout - Admin authenticated!')
        setAuthState('authenticated')
      } else {
        console.log('Dashboard layout - User not admin or missing, role:', currentUser?.role)
        setAuthState('unauthenticated')
      }
    }
    
    checkAuth()
  }, [user, loadUser])

  // Handle redirects based on auth state
  useEffect(() => {
    if (authState === 'unauthenticated') {
      console.log('Dashboard layout - Redirecting to login')
      router.replace('/admin/login')
    }
  }, [authState, router])

  // Show loading while checking
  if (authState === 'checking' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    )
  }

  // Only render children when authenticated
  if (authState === 'authenticated') {
    return <>{children}</>
  }

  // Fallback (should not reach here)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
    </div>
  )
}
