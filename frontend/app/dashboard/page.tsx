'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Clock, Video, MessageSquare, ChevronRight, User, Bell, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { userApi } from '@/lib/api'
import { Booking } from '@/types'
import Navbar from '@/components/Navbar'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0
  })
  const [upcomingAppointments, setUpcomingAppointments] = useState<Booking[]>([])
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await userApi.getDashboard()
      const data = response.data.data
      setStats(data.stats)
      setUpcomingAppointments(data.upcomingAppointments)
      setRecentBookings(data.recentBookings)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <>
      <Navbar />
      <div className="page-shell bg-gray-50">
        <div className="page-content max-w-7xl">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </motion.button>

          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.fullName?.split(' ')[0]}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your health journey
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Bookings', value: stats.total, icon: Calendar, color: 'bg-blue-500' },
              { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-500' },
              { label: 'Upcoming', value: stats.accepted, icon: Video, color: 'bg-green-500' },
              { label: 'Completed', value: stats.completed, icon: User, color: 'bg-purple-500' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm"
              >
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upcoming Appointments */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
                  <Link
                    href="/bookings"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming appointments</p>
                    <Link
                      href="/booking"
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Book Appointment
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((booking) => (
                      <div
                        key={booking._id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Calendar className="w-7 h-7 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {typeof booking.doctor === 'object' ? booking.doctor?.fullName : 'Doctor'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.assignedDate && new Date(booking.assignedDate).toLocaleDateString()} at {booking.assignedTime}
                          </p>
                          <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        {booking.meetingLink && (
                          <Link
                            href={booking.meetingLink}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Join
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Bookings */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Bookings</h2>
                {recentBookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No bookings yet</p>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.slice(0, 3).map((booking) => (
                      <div
                        key={booking._id}
                        className="flex items-center justify-between p-4 border border-gray-100 rounded-xl"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{booking.medicalProblem}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <Link
                    href="/booking"
                    className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Book Appointment</p>
                      <p className="text-sm text-gray-500">Schedule a new visit</p>
                    </div>
                  </Link>

                  <Link
                    href="/chat"
                    className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Chat with Doctor</p>
                      <p className="text-sm text-gray-500">Get instant answers</p>
                    </div>
                  </Link>

                  <Link
                    href="/video-call"
                    className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Video Consultation</p>
                      <p className="text-sm text-gray-500">Start a video call</p>
                    </div>
                  </Link>

                  <Link
                    href="/notifications"
                    className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Notifications</p>
                      <p className="text-sm text-gray-500">View updates</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Profile Card */}
              <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl shadow-sm p-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                    {user?.fullName?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{user?.fullName}</p>
                    <p className="text-blue-100 text-sm">{user?.email}</p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="block w-full py-2 bg-white/20 rounded-lg text-center hover:bg-white/30 transition-colors"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
