'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginRedirect() {
  const router = useRouter()
  const secretUrl = process.env.NEXT_PUBLIC_ADMIN_SECRET_URL || 'admin'

  useEffect(() => {
    // Redirect to the secret admin URL
    router.replace(`/${secretUrl}`)
  }, [router, secretUrl])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to secure admin access...</p>
      </div>
    </div>
  )
}
