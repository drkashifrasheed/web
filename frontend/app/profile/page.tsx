'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, Calendar,
  Save, Camera, Loader2, AlertCircle, CheckCircle, Lock,
  Bell, Shield, FileText, Eye, EyeOff, LogOut,
  ChevronRight, Clock, XCircle, ShieldCheck, Trash2
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { userApi, bookingApi, authApi } from '@/lib/api'
import { Booking } from '@/types'
import Navbar from '@/components/Navbar'

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateUser, logout, isAuthenticated, isLoading: authLoading, token } = useAuthStore()
  const [authHydrated, setAuthHydrated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [activeTab, setActiveTab] = useState('personal')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  
  // Settings state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpType, setOtpType] = useState<'profile' | 'cancel' | 'delete' | null>(null)
  const [countdown, setCountdown] = useState(600)
  const [tempProfileData, setTempProfileData] = useState<any>(null)
  
  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    age: '',
    gender: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Wait for persisted auth state before redirecting
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setAuthHydrated(true)
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        setAuthHydrated(true)
      })
      return () => unsub()
    }
  }, [])

  useEffect(() => {
    if (!authHydrated || authLoading) return
    if (!token) {
      router.replace('/login')
    }
  }, [authHydrated, authLoading, token, router])

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        age: user.age?.toString() || '',
        gender: user.gender || ''
      })
      loadBookings()
    }
  }, [user])

  // Countdown timer for OTP
  useEffect(() => {
    if (showOTPModal && countdown > 0) {
      const timer = setInterval(() => setCountdown(prev => prev - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [showOTPModal, countdown])

  const loadBookings = async () => {
    setIsLoadingBookings(true)
    try {
      const response = await bookingApi.getBookings()
      setBookings(response.data.data.bookings)
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setIsLoadingBookings(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent as keyof typeof prev] as any, [child]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  // Send OTP for profile update
  const handleSendProfileOTP = async () => {
    setIsSaving(true)
    try {
      const updateData = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        age: parseInt(formData.age) || undefined,
        gender: formData.gender || undefined
      }
      
      setTempProfileData(updateData)
      setOtpType('profile')
      setCountdown(600)
      setOtp(['', '', '', '', '', ''])
      
      // Send OTP
      await authApi.sendProfileUpdateOTP({ email: user?.email })
      
      setShowOTPModal(true)
      setMessage({ type: 'success', text: 'Verification code sent to your email!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send verification code.' })
    } finally {
      setIsSaving(false)
    }
  }

  // Verify OTP and update profile
  const handleVerifyProfileOTP = async () => {
    const code = otp.join('')
    if (code.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter all 6 digits' })
      return
    }

    setIsSaving(true)
    try {
      await authApi.verifyProfileUpdateOTP({ email: user?.email, otp: code, data: tempProfileData })
      
      const response = await userApi.getProfile()
      updateUser(response.data.data.user)
      
      setShowOTPModal(false)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTempProfileData(null)
    } catch (error) {
      setMessage({ type: 'error', text: 'Invalid verification code.' })
      setOtp(['', '', '', '', '', ''])
    } finally {
      setIsSaving(false)
    }
  }

  // Send OTP for booking cancellation
  const handleCancelBooking = async (booking: Booking) => {
    setSelectedBooking(booking)
    setOtpType('cancel')
    setCountdown(600)
    setOtp(['', '', '', '', '', ''])
    
    try {
      await bookingApi.sendCancelOTP(booking._id)
      setShowCancelModal(true)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send cancellation code.' })
    }
  }

  // Verify OTP and cancel booking
  const handleVerifyCancelOTP = async () => {
    const code = otp.join('')
    if (code.length !== 6 || !selectedBooking) return

    setIsSaving(true)
    try {
      await bookingApi.verifyCancelOTP(selectedBooking._id, code)
      setShowCancelModal(false)
      setSelectedBooking(null)
      setMessage({ type: 'success', text: 'Booking cancelled successfully!' })
      loadBookings()
    } catch (error) {
      setMessage({ type: 'error', text: 'Invalid verification code.' })
      setOtp(['', '', '', '', '', ''])
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete account OTP
  const handleSendDeleteAccountOTP = async () => {
    setShowDeleteModal(true)
    setOtpType('delete')
    setCountdown(600)
    setOtp(['', '', '', '', '', ''])
    
    try {
      await authApi.sendDeleteAccountOTP()
      setMessage({ type: 'success', text: 'Verification code sent to your email!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send verification code.' })
      setShowDeleteModal(false)
    }
  }

  // Handle verify and delete account
  const handleVerifyDeleteAccount = async () => {
    const code = otp.join('')
    if (code.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter all 6 digits' })
      return
    }

    setIsSaving(true)
    try {
      await authApi.verifyDeleteAccount({ otp: code })
      
      // Clear all data and logout
      logout()
      router.replace('/')
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Invalid verification code.' })
      setOtp(['', '', '', '', '', ''])
    } finally {
      setIsSaving(false)
    }
  }

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' })
      return
    }
    
    setIsSaving(true)
    try {
      await authApi.changePassword(passwordData)
      setShowPasswordModal(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setMessage({ type: 'success', text: 'Password changed successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const response = await userApi.updateProfileImage(formData)
      updateUser(response.data.data.user)
      setMessage({ type: 'success', text: 'Profile image updated!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload image.' })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      accepted: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200',
      cancelled: 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Shield }
  ]

  if (!authHydrated || authLoading || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="page-shell bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="page-content max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6"
          >
            <h1 className="heading-page">My Profile</h1>
            <p className="subheading-page mt-1">Manage your info, bookings & settings</p>
          </motion.div>

          {/* Mobile profile strip */}
          <div className="lg:hidden card-mobile mb-4 flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.charAt(0)
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-0.5 -right-0.5 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate">{user?.fullName}</h3>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="lg:hidden tabs-scroll mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`tab-pill ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Message */}
          <AnimatePresence>
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                  message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {message.text}
                <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto">
                  <XCircle className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid lg:grid-cols-4 gap-4 sm:gap-8">
            {/* Sidebar — desktop only */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block lg:col-span-1"
            >
              <div className="card-mobile sticky top-24">
                {/* Profile Image */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-4xl font-bold text-white mx-auto overflow-hidden">
                      {user?.profileImage ? (
                        <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
                      ) : (
                        user?.fullName?.charAt(0)
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors shadow-lg"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mt-4">{user?.fullName}</h3>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                    {user?.role}
                  </span>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  ))}
                </nav>

                {/* Legal Links */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-3">Legal</p>
                  <Link href="/terms" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    <FileText className="w-4 h-4" />
                    Terms of Service
                  </Link>
                  <Link href="/privacy" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    <Shield className="w-4 h-4" />
                    Privacy Policy
                  </Link>
                </div>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 mt-6 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="card-mobile">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" />
                    Personal Information
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="email" name="email" value={formData.email} disabled
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="number" name="age" value={formData.age} onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                  </div>

                  <p className="mt-4 text-sm text-gray-500">
                    Medical details (symptoms, history, etc.) are collected only when you submit a booking — not stored on your profile.
                  </p>

                  <div className="mt-8 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Secure Update</p>
                      <p className="text-sm text-blue-700">For your security, we'll send a verification code to your email when you save changes.</p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSendProfileOTP}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Bookings Tab */}
              {activeTab === 'bookings' && (
                <div className="card-mobile">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-blue-500" />
                      My Bookings
                    </h2>
                    <Link href="/booking" className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      <Calendar className="w-4 h-4" />
                      New Booking
                    </Link>
                  </div>

                  {isLoadingBookings ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No bookings yet</p>
                      <Link href="/booking" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
                        Book Your First Appointment
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div key={booking._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900">{booking.medicalProblem}</h3>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                <Clock className="w-4 h-4 inline mr-1" />
                                {booking.assignedDate ? new Date(booking.assignedDate).toLocaleDateString() : 'Date pending'} 
                                {booking.assignedTime && ` at ${booking.assignedTime}`}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Type: <span className="capitalize">{booking.appointmentType?.replace('-', ' ')}</span>
                              </p>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              {booking.paymentStatus === 'awaiting_payment' && (
                                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                  Payment pending
                                </span>
                              )}
                              {booking.status === 'pending' && (
                                <button
                                  onClick={() => handleCancelBooking(booking)}
                                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Cancel
                                </button>
                              )}
                              {booking.status === 'accepted' && (
                                <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                                  Confirmed — check-up: {booking.assignedDate ? new Date(booking.assignedDate).toLocaleDateString() : 'TBD'}
                                  {booking.assignedTime ? ` ${booking.assignedTime}` : ''}
                                </span>
                              )}
                              {booking.videoCallStatus === 'requested' && (
                                <button
                                  onClick={async () => {
                                    await bookingApi.acceptVideoCall(booking._id)
                                    router.push(`/video-call/${booking._id}`)
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
                                >
                                  Accept video call
                                </button>
                              )}
                              {['accepted', 'active'].includes(booking.videoCallStatus || '') && booking.status === 'accepted' && (
                                <Link
                                  href={`/video-call/${booking._id}`}
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                  Join video call
                                  <ChevronRight className="w-4 h-4" />
                                </Link>
                              )}
                              <Link
                                href="/chat"
                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                              >
                                Messages
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="card-mobile">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Lock className="w-6 h-6 text-blue-500" />
                      Change Password
                    </h2>
                    
                    <div className="space-y-4 max-w-md">
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword.current ? 'text' : 'password'}
                          placeholder="Current Password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                          onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword.new ? 'text' : 'password'}
                          placeholder="New Password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                          onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword.confirm ? 'text' : 'password'}
                          placeholder="Confirm New Password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                          onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      <button
                        onClick={handlePasswordChange}
                        disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="card-mobile">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Bell className="w-6 h-6 text-blue-500" />
                      Notification Preferences
                    </h2>
                    
                    <div className="space-y-4">
                      {[
                        { id: 'appointments', label: 'Appointment reminders and updates', checked: true },
                        { id: 'results', label: 'Test results availability', checked: true },
                        { id: 'promotions', label: 'Health tips and promotions', checked: false },
                        { id: 'newsletter', label: 'Monthly newsletter', checked: false }
                      ].map((pref) => (
                        <label key={pref.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <input type="checkbox" defaultChecked={pref.checked} className="w-5 h-5 text-blue-500 rounded" />
                          <span className="text-gray-700">{pref.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Legal Section */}
                  <div className="card-mobile">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <FileText className="w-6 h-6 text-blue-500" />
                      Legal Information
                    </h2>
                    
                    <div className="space-y-3">
                      <Link href="/terms" className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <span className="text-gray-700">Terms of Service</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </Link>
                      
                      <Link href="/privacy" className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-blue-500" />
                          <span className="text-gray-700">Privacy Policy</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </Link>
                    </div>
                  </div>

                  {/* Delete Account Section */}
                  <div className="card-mobile border-2 border-red-100">
                    <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
                      <Trash2 className="w-6 h-6" />
                      Delete Account
                    </h2>
                    
                    <div className="bg-red-50 p-4 rounded-xl mb-4">
                      <p className="text-red-700 text-sm">
                        <strong>Warning:</strong> This action is permanent and cannot be undone.
                        All your data including bookings, messages, and medical records will be permanently deleted.
                      </p>
                    </div>
                    
                    <button
                      onClick={handleSendDeleteAccountOTP}
                      disabled={isSaving}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                      Delete My Account
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* OTP Modal for Profile Update */}
      <AnimatePresence>
        {showOTPModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card-mobile max-w-md w-full mx-4 sm:mx-0"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Verify Your Identity</h3>
                <p className="text-gray-500 mt-2">Enter the 6-digit code sent to {user?.email}</p>
              </div>

              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newOtp = [...otp]
                      newOtp[index] = e.target.value
                      setOtp(newOtp)
                      if (e.target.value && index < 5) {
                        document.querySelectorAll('input')[index + 1]?.focus()
                      }
                    }}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                ))}
              </div>

              <p className="text-center text-sm text-gray-500 mb-6">
                Code expires in <span className="font-semibold text-blue-600">{formatTime(countdown)}</span>
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowOTPModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyProfileOTP}
                  disabled={isSaving || otp.join('').length !== 6}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OTP Modal for Booking Cancellation */}
      <AnimatePresence>
        {showCancelModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card-mobile max-w-md w-full mx-4 sm:mx-0"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Cancel Booking</h3>
                <p className="text-gray-500 mt-2">Enter the 6-digit code sent to your email to confirm cancellation</p>
              </div>

              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newOtp = [...otp]
                      newOtp[index] = e.target.value
                      setOtp(newOtp)
                      if (e.target.value && index < 5) {
                        document.querySelectorAll('input')[index + 1]?.focus()
                      }
                    }}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                  />
                ))}
              </div>

              <p className="text-center text-sm text-gray-500 mb-6">
                Code expires in <span className="font-semibold text-red-600">{formatTime(countdown)}</span>
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowCancelModal(false); setSelectedBooking(null); }}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleVerifyCancelOTP}
                  disabled={isSaving || otp.join('').length !== 6}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Cancel Booking'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OTP Modal for Delete Account */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card-mobile max-w-md w-full mx-4 sm:mx-0 border-2 border-red-100"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-red-600">Delete Account</h3>
                <p className="text-gray-500 mt-2">Enter the 6-digit code sent to your email to permanently delete your account</p>
              </div>

              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newOtp = [...otp]
                      newOtp[index] = e.target.value
                      setOtp(newOtp)
                      if (e.target.value && index < 5) {
                        document.querySelectorAll('input')[index + 1]?.focus()
                      }
                    }}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-red-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                  />
                ))}
              </div>

              <p className="text-center text-sm text-gray-500 mb-6">
                Code expires in <span className="font-semibold text-red-600">{formatTime(countdown)}</span>
              </p>

              <div className="bg-red-50 p-4 rounded-xl mb-6">
                <p className="text-red-700 text-sm text-center">
                  <strong>Warning:</strong> This will permanently delete your account and all associated data.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setOtp(['', '', '', '', '', '']); }}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyDeleteAccount}
                  disabled={isSaving || otp.join('').length !== 6}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Delete Account'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
