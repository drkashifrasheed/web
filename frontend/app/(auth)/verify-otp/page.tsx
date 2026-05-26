'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, ArrowLeft, RefreshCw, Stethoscope, Mail, CheckCircle, Home } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(600) // 10 minutes
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  
  const { 
    otpState, 
    isAuthenticated,
    verifyLoginOTP, 
    verifyRegisterOTP, 
    resendLoginOTP, 
    resendRegisterOTP,
    clearOTPState 
  } = useAuthStore()

  // Track hydration status of the auth store
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        setHydrated(true)
      })
      return () => unsub()
    }
  }, [])

  // Redirect if no OTP state, but only after store hydration is completed.
  // Skip when verification just succeeded — otpState is cleared on success.
  useEffect(() => {
    if (!hydrated || success || isAuthenticated) return

    if (!otpState.email || !otpState.otpType) {
      router.push('/login')
    }
  }, [hydrated, success, isAuthenticated, otpState.email, otpState.otpType, router])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [countdown])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit
    
    if (!/^\d*$/.test(value)) return // Only allow numbers

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits are filled
    if (index === 5 && value) {
      const fullOtp = [...newOtp.slice(0, 5), value].join('')
      if (fullOtp.length === 6) {
        handleVerify(fullOtp)
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d{6}$/.test(pastedData)) return

    const newOtp = pastedData.split('')
    setOtp(newOtp)
    
    // Focus last input
    inputRefs.current[5]?.focus()
    
    // Auto-submit
    handleVerify(pastedData)
  }

  const handleVerify = async (fullOtp?: string) => {
    const code = fullOtp || otp.join('')
    
    if (code.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      if (otpState.otpType === 'login') {
        // Get the user data directly from the API response
        const user = await verifyLoginOTP(code)
        setSuccess(true)
        
        // Check if admin accessed via secret URL
        const adminAccessMethod = sessionStorage.getItem('adminAccessMethod')
        
        console.log('OTP Verify - User from API:', user)
        console.log('OTP Verify - User role:', user?.role)
        console.log('OTP Verify - Admin access method:', adminAccessMethod)
        console.log('OTP Verify - Token in localStorage:', localStorage.getItem('token') ? 'exists' : 'missing')
        
        // Admin goes to admin dashboard if accessed via secret URL
        let destination = '/profile'
        if (user?.role === 'admin' && adminAccessMethod === 'secret-url') {
          destination = '/secure-admin-dashboard'
          console.log('OTP Verify - Redirecting to admin dashboard')
        } else {
          console.log('OTP Verify - Redirecting to profile, role:', user?.role, 'accessMethod:', adminAccessMethod)
        }
        
        // Clean up session storage
        sessionStorage.removeItem('postLoginRedirect')
        sessionStorage.removeItem('adminAccessMethod')
        
        console.log('OTP Verify - Navigating to:', destination)
        
        // Small delay to ensure token is saved to localStorage
        await new Promise(resolve => setTimeout(resolve, 200))
        
        console.log('OTP Verify - Token after delay:', localStorage.getItem('token') ? 'exists' : 'missing')
        
        router.replace(destination)
      } else if (otpState.otpType === 'register') {
        await verifyRegisterOTP(code)
        setSuccess(true)
        router.replace('/profile')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code')
      // Clear inputs on error
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setError('')

    try {
      if (otpState.otpType === 'login') {
        await resendLoginOTP()
      } else if (otpState.otpType === 'register') {
        await resendRegisterOTP()
      }
      setCountdown(600) // Reset countdown
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code')
    } finally {
      setIsResending(false)
    }
  }

  const handleCancel = () => {
    clearOTPState()
    router.push(otpState.otpType === 'login' ? '/login' : '/register')
  }

  if (!hydrated || !otpState.email) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Back to Home Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
      >
        <Home className="w-5 h-5" />
        Back to Home
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl"
      >
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mb-4">
            {success ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <Shield className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {success ? 'Verified!' : 'Verify Your Email'}
          </h2>
          <p className="mt-2 text-gray-600">
            {success 
              ? 'Redirecting to dashboard...'
              : `Enter the 6-digit code sent to ${otpState.email}`
            }
          </p>
        </div>

        {!success && (
          <>
            {/* Email Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            {/* OTP Input */}
            <div className="space-y-6">
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={isLoading}
                    className={`w-12 h-14 sm:w-14 sm:h-16 text-2xl font-bold text-center border-2 rounded-xl outline-none transition-all
                      ${error 
                        ? 'border-red-300 bg-red-50 text-red-600' 
                        : digit 
                          ? 'border-blue-500 bg-blue-50 text-blue-600' 
                          : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  />
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-red-500 text-sm"
                >
                  {error}
                </motion.p>
              )}

              {/* Countdown */}
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Code expires in{' '}
                  <span className={`font-semibold ${countdown < 60 ? 'text-red-500' : 'text-blue-600'}`}>
                    {formatTime(countdown)}
                  </span>
                </p>
              </div>

              {/* Verify Button */}
              <button
                onClick={() => handleVerify()}
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  'Verify Code'
                )}
              </button>

              {/* Resend Section */}
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResend}
                  disabled={isResending || countdown > 540} // Can resend after 1 minute
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 540 ? (
                    `Resend in ${formatTime(countdown - 540)}`
                  ) : (
                    'Resend Code'
                  )}
                </button>
              </div>

              {/* Cancel Button */}
              <button
                onClick={handleCancel}
                className="w-full py-3 px-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to {otpState.otpType === 'login' ? 'Login' : 'Sign Up'}
              </button>
            </div>
          </>
        )}

        {/* Success Animation */}
        {success && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex justify-center"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </motion.div>
        )}

        {/* Security Note */}
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            Secure verification powered by Dr Mahar Kashif Rasheed
          </p>
        </div>
      </motion.div>
    </div>
  )
}
