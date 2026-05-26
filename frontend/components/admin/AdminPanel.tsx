'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  UserCheck,
  Clock,
  Bell,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Filter,
  Home,
  Stethoscope,
  RefreshCw,
  Menu,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi, bookingApi, userApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Booking, User, Message } from '@/types'

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings }
] as const

type TabId = (typeof sidebarItems)[number]['id']

export default function AdminPanel() {
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalBookings: 0,
    pendingBookings: 0,
    todayBookings: 0
  })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [recentUsers, setRecentUsers] = useState<User[]>([])

  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsFilter, setBookingsFilter] = useState('')
  const [bookingsPage, setBookingsPage] = useState(1)
  const [bookingsTotal, setBookingsTotal] = useState(0)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [doctors, setDoctors] = useState<User[]>([])
  const [actionForm, setActionForm] = useState({
    status: 'accepted' as string,
    assignedDate: '',
    assignedTime: '10:00',
    timePeriod: 'AM' as 'AM' | 'PM',
    doctorId: '',
    meetingLink: '',
    rejectionReason: '',
    adminNotes: ''
  })

  const [users, setUsers] = useState<User[]>([])
  const [usersFilter, setUsersFilter] = useState({ role: '', search: '' })
  const [showDoctorForm, setShowDoctorForm] = useState(false)
  const [doctorForm, setDoctorForm] = useState({
    fullName: '',
    email: '',
    password: '',
    specialization: '',
    experience: '0',
    consultationFee: '0'
  })

  const [messages, setMessages] = useState<Message[]>([])
  const [broadcast, setBroadcast] = useState({
    title: '',
    message: '',
    targetRole: '',
    priority: 'medium'
  })

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-gray-100 text-gray-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const loadDashboard = useCallback(async () => {
    const res = await adminApi.getDashboard()
    const data = res.data.data
    setStats(data.stats)
    setRecentBookings(data.recentBookings)
    setRecentUsers(data.recentUsers)
  }, [])

  const loadBookings = useCallback(async () => {
    const res = await adminApi.getAllBookings({
      status: bookingsFilter || undefined,
      page: bookingsPage,
      limit: 15
    })
    setBookings(res.data.data.bookings)
    setBookingsTotal(res.data.data.total)
  }, [bookingsFilter, bookingsPage])

  const loadUsers = useCallback(async () => {
    const res = await adminApi.getAllUsers({
      role: usersFilter.role || undefined,
      search: usersFilter.search || undefined,
      page: 1,
      limit: 50
    })
    setUsers(res.data.data.users)
  }, [usersFilter])

  const loadMessages = useCallback(async () => {
    const res = await adminApi.getRecentMessages(40)
    setMessages(res.data.data.messages)
  }, [])

  const loadDoctors = useCallback(async () => {
    const res = await adminApi.getDoctors()
    setDoctors(res.data.data.doctors)
  }, [])

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      try {
        await loadDashboard()
        await loadDoctors()
      } catch {
        toast.error('Failed to load admin data. Check login & API.')
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [loadDashboard, loadDoctors])

  useEffect(() => {
    if (activeTab === 'bookings') loadBookings()
  }, [activeTab, bookingsFilter, bookingsPage, loadBookings])

  useEffect(() => {
    if (activeTab === 'users') loadUsers()
  }, [activeTab, usersFilter, loadUsers])

  useEffect(() => {
    if (activeTab === 'messages') loadMessages()
  }, [activeTab, loadMessages])

  const handleBookingAction = async () => {
    if (!selectedBooking) return
    try {
      await bookingApi.updateStatus(selectedBooking._id, {
        status: actionForm.status,
        assignedDate: actionForm.assignedDate || undefined,
        assignedTime: actionForm.assignedTime || undefined,
        timePeriod: actionForm.timePeriod,
        doctorId: actionForm.doctorId || undefined,
        meetingLink: actionForm.meetingLink || undefined,
        adminNotes: actionForm.adminNotes || undefined,
        rejectionReason: actionForm.rejectionReason || undefined
      })
      toast.success('Booking updated')
      setSelectedBooking(null)
      await loadBookings()
      await loadDashboard()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await userApi.createDoctor({
        fullName: doctorForm.fullName,
        email: doctorForm.email,
        password: doctorForm.password,
        specialization: doctorForm.specialization,
        qualifications: [],
        experience: parseInt(doctorForm.experience, 10) || 0,
        consultationFee: parseFloat(doctorForm.consultationFee) || 0
      })
      toast.success('Doctor created')
      setShowDoctorForm(false)
      setDoctorForm({
        fullName: '',
        email: '',
        password: '',
        specialization: '',
        experience: '0',
        consultationFee: '0'
      })
      await loadUsers()
      await loadDoctors()
      await loadDashboard()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create doctor')
    }
  }

  const handleToggleUser = async (id: string, isActive: boolean) => {
    try {
      await userApi.updateUserStatus(id, !isActive)
      toast.success(isActive ? 'User deactivated' : 'User activated')
      await loadUsers()
    } catch {
      toast.error('Failed to update user')
    }
  }

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await adminApi.sendBroadcastNotification({
        title: broadcast.title,
        message: broadcast.message,
        targetRole: broadcast.targetRole || undefined,
        priority: broadcast.priority
      })
      toast.success(`Sent to ${res.data.data.sentCount} users`)
      setBroadcast({ title: '', message: '', targetRole: '', priority: 'medium' })
    } catch {
      toast.error('Broadcast failed')
    }
  }

  const openBookingModal = (booking: Booking) => {
    setSelectedBooking(booking)
    const timeMatch = booking.assignedTime?.match(/(\d{1,2}:\d{2})\s*(AM|PM)?/i)
    setActionForm({
      status: booking.status === 'pending' ? 'accepted' : booking.status,
      assignedDate: booking.assignedDate?.split('T')[0] || '',
      assignedTime: timeMatch?.[1] || '10:00',
      timePeriod: (timeMatch?.[2]?.toUpperCase() as 'AM' | 'PM') || 'AM',
      doctorId: typeof booking.doctor === 'object' ? booking.doctor?._id : (booking.doctor as string) || '',
      meetingLink: booking.meetingLink || '',
      rejectionReason: booking.rejectionReason || '',
      adminNotes: booking.adminNotes || ''
    })
  }

  const patientName = (b: Booking) =>
    b.patientInfo?.fullName ||
    (typeof b.patient === 'object' && b.patient?.fullName) ||
    'Patient'

  if (isLoading && activeTab === 'dashboard') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    )
  }

  const selectTab = (id: TabId) => {
    setActiveTab(id)
    setMobileNavOpen(false)
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col lg:flex-row pb-[4.5rem] lg:pb-0">
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 shadow-sm safe-top">
        <div className="flex items-center justify-between h-14 px-3">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="btn-touch p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="min-w-0 flex-1 text-center px-2">
            <h1 className="font-bold text-gray-900 text-sm truncate">Admin Panel</h1>
            <p className="text-[10px] text-gray-500 truncate capitalize">{activeTab}</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await loadDashboard()
              if (activeTab === 'bookings') await loadBookings()
              if (activeTab === 'users') await loadUsers()
              if (activeTab === 'messages') await loadMessages()
              toast.success('Refreshed')
            }}
            className="btn-touch p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {mobileNavOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={`w-64 max-w-[85vw] bg-white shadow-xl fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-10 safe-top safe-bottom ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-gray-900 text-sm sm:text-base">Admin Panel</h1>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="lg:hidden btn-touch p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all min-h-[48px] ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </button>
          ))}
          <Link
            href="/"
            onClick={() => setMobileNavOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 mt-2 min-h-[48px]"
          >
            <Home className="w-5 h-5" />
            View Website
          </Link>
        </nav>

        <div className="p-3 sm:p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              logout()
              window.location.href = '/admin/login'
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl min-h-[48px]"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] safe-bottom">
        <div className="flex items-stretch justify-around px-1 py-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-2 min-h-[52px] rounded-lg ${
                activeTab === item.id ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : ''}`} />
              <span className="text-[10px] font-medium mt-0.5 truncate max-w-full px-0.5">
                {item.label.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 w-full lg:ml-64 pt-14 lg:pt-0 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 min-h-[100dvh]">
        <div className="hidden lg:flex items-center justify-between mb-6 lg:mb-8 gap-4">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 capitalize truncate">
              {activeTab === 'dashboard' ? 'Dashboard Overview' : activeTab}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 truncate">
              Welcome, {user?.fullName || 'Admin'}
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await loadDashboard()
              if (activeTab === 'bookings') await loadBookings()
              if (activeTab === 'users') await loadUsers()
              if (activeTab === 'messages') await loadMessages()
              toast.success('Refreshed')
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl hover:bg-gray-50 min-h-[44px] flex-shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              {[
                { label: 'Patients', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-blue-600' },
                { label: 'Doctors', value: stats.totalDoctors, icon: UserCheck, color: 'from-green-500 to-green-600' },
                { label: 'All Bookings', value: stats.totalBookings, icon: Calendar, color: 'from-purple-500 to-purple-600' },
                { label: 'Pending', value: stats.pendingBookings, icon: Clock, color: 'from-orange-500 to-orange-600' }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-6 rounded-2xl shadow-lg"
                >
                  <div className={`w-11 h-11 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-5 border-b flex justify-between items-center">
                  <h3 className="font-semibold">Recent Bookings</h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-sm text-blue-600">
                    Manage all
                  </button>
                </div>
                <div className="divide-y max-h-96 overflow-y-auto">
                  {recentBookings.length === 0 ? (
                    <p className="p-6 text-gray-500 text-center">No bookings yet</p>
                  ) : (
                    recentBookings.slice(0, 8).map((b) => (
                      <button
                        key={b._id}
                        onClick={() => {
                          setActiveTab('bookings')
                          openBookingModal(b)
                        }}
                        className="w-full p-4 flex justify-between items-center hover:bg-gray-50 text-left"
                      >
                        <div>
                          <p className="font-medium">{patientName(b)}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">{b.medicalProblem}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(b.status)}`}>
                          {b.status}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-5 border-b flex justify-between items-center">
                  <h3 className="font-semibold">Recent Patients</h3>
                  <button onClick={() => setActiveTab('users')} className="text-sm text-blue-600">
                    View users
                  </button>
                </div>
                <div className="divide-y max-h-96 overflow-y-auto">
                  {recentUsers.map((u) => (
                    <div key={u._id} className="p-4 flex justify-between">
                      <div>
                        <p className="font-medium">{u.fullName}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'bookings' && (
          <div className="card-mobile">
            <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
              <div className="relative flex-1">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={bookingsFilter}
                  onChange={(e) => {
                    setBookingsFilter(e.target.value)
                    setBookingsPage(1)
                  }}
                  className="input-mobile pl-10"
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {bookings.map((b) => (
                <button
                  key={b._id}
                  type="button"
                  onClick={() => openBookingModal(b)}
                  className="w-full text-left p-4 border border-gray-100 rounded-xl hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <p className="font-semibold text-gray-900">{patientName(b)}</p>
                    <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${getStatusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{b.medicalProblem}</p>
                  <p className="text-xs text-gray-500 capitalize">{b.appointmentType?.replace('-', ' ')}</p>
                </button>
              ))}
            </div>

            <div className="hidden md:block table-scroll">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 pr-4">Patient</th>
                    <th className="pb-3 pr-4">Problem</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 pr-4 font-medium">{patientName(b)}</td>
                      <td className="py-3 pr-4 max-w-[200px] truncate">{b.medicalProblem}</td>
                      <td className="py-3 pr-4 capitalize">{b.appointmentType?.replace('-', ' ')}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(b.status)}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => openBookingModal(b)}
                          className="text-blue-600 hover:underline flex items-center gap-1 min-h-[44px]"
                        >
                          <Eye className="w-4 h-4" />
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-gray-500">Total: {bookingsTotal} bookings</p>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    placeholder="Search name, email, phone..."
                    value={usersFilter.search}
                    onChange={(e) => setUsersFilter((f) => ({ ...f, search: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                    className="w-full pl-10 pr-4 py-2 border rounded-xl"
                  />
                </div>
                <select
                  value={usersFilter.role}
                  onChange={(e) => setUsersFilter((f) => ({ ...f, role: e.target.value }))}
                  className="px-4 py-2 border rounded-xl"
                >
                  <option value="">All roles</option>
                  <option value="patient">Patients</option>
                  <option value="doctor">Doctors</option>
                  <option value="admin">Admins</option>
                </select>
                <button onClick={loadUsers} className="px-4 py-2 bg-blue-500 text-white rounded-xl">
                  Search
                </button>
                <button
                  onClick={() => setShowDoctorForm(!showDoctorForm)}
                  className="px-4 py-2 border border-blue-500 text-blue-600 rounded-xl flex items-center gap-2"
                >
                  <Stethoscope className="w-4 h-4" />
                  Add Doctor
                </button>
              </div>

              {showDoctorForm && (
                <form onSubmit={handleCreateDoctor} className="mb-6 p-4 bg-blue-50 rounded-xl grid md:grid-cols-2 gap-4">
                  <input
                    placeholder="Full name"
                    required
                    value={doctorForm.fullName}
                    onChange={(e) => setDoctorForm({ ...doctorForm, fullName: e.target.value })}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="password"
                    placeholder="Password (min 6)"
                    required
                    minLength={6}
                    value={doctorForm.password}
                    onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    placeholder="Specialization"
                    required
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <button type="submit" className="md:col-span-2 py-2 bg-blue-600 text-white rounded-lg font-medium">
                    Create Doctor Account
                  </button>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">Email</th>
                      <th className="pb-3 pr-4">Role</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b border-gray-50">
                        <td className="py-3 pr-4 font-medium">{u.fullName}</td>
                        <td className="py-3 pr-4">{u.email}</td>
                        <td className="py-3 pr-4 capitalize">{u.role}</td>
                        <td className="py-3 pr-4">
                          {(u as User & { isActive?: boolean }).isActive !== false ? (
                            <span className="text-green-600">Active</span>
                          ) : (
                            <span className="text-red-600">Inactive</span>
                          )}
                        </td>
                        <td className="py-3">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() =>
                                handleToggleUser(u._id, (u as User & { isActive?: boolean }).isActive !== false)
                              }
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Toggle active
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-semibold mb-4">Recent platform messages</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No messages yet</p>
              ) : (
                messages.map((m) => (
                  <div key={m._id} className="p-4 border rounded-xl bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>
                        {(m.sender as User)?.fullName || 'User'} → {(m.receiver as User)?.fullName || 'User'}
                      </span>
                      <span>{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-800">{m.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-blue-500" />
                Broadcast notification
              </h3>
              <form onSubmit={handleBroadcast} className="space-y-4">
                <input
                  required
                  placeholder="Title"
                  value={broadcast.title}
                  onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl"
                />
                <textarea
                  required
                  placeholder="Message"
                  rows={4}
                  value={broadcast.message}
                  onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl"
                />
                <select
                  value={broadcast.targetRole}
                  onChange={(e) => setBroadcast({ ...broadcast, targetRole: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl"
                >
                  <option value="">All users</option>
                  <option value="patient">Patients only</option>
                  <option value="doctor">Doctors only</option>
                </select>
                <button type="submit" className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium">
                  Send notification
                </button>
              </form>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold mb-4">Admin account</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Name</dt>
                  <dd className="font-medium">{user?.fullName}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="font-medium">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Panel URL</dt>
                  <dd className="font-medium text-blue-600">/secure-admin-dashboard</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Secret Login URL</dt>
                  <dd className="font-medium text-blue-600">/admin</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-gray-500">
                Default admin is created from backend .env (ADMIN_EMAIL / ADMIN_PASSWORD) on server start.
              </p>
            </div>
          </div>
        )}
      </main>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4 safe-top safe-bottom">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <h3 className="text-lg font-bold mb-4">Manage booking</h3>
            <div className="text-sm space-y-3 mb-4 p-4 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <p>
                  <strong>Patient:</strong> {patientName(selectedBooking)}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedBooking.patientInfo?.phoneNumber || '—'}
                </p>
              </div>
              <p>
                <strong>Problem:</strong> {selectedBooking.medicalProblem}
              </p>
              {selectedBooking.patientInfo?.allergies && (
                <p>
                  <strong>Allergies:</strong> {selectedBooking.patientInfo.allergies}
                </p>
              )}
              {selectedBooking.patientInfo?.medicalHistory && (
                <p>
                  <strong>History:</strong> {selectedBooking.patientInfo.medicalHistory}
                </p>
              )}
              {selectedBooking.additionalNotes && (
                <p>
                  <strong>Notes:</strong> {selectedBooking.additionalNotes}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <strong>Payment:</strong>
                <span className={`px-2 py-1 rounded text-xs ${selectedBooking.paymentStatus === 'verified' ? 'bg-green-100 text-green-700' : selectedBooking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                  {selectedBooking.paymentStatus || '—'}
                </span>
              </div>
              
              {/* Payment Proof Image - Responsive */}
              {selectedBooking.paymentProofUrl && (
                <div className="mt-4">
                  <p className="font-semibold mb-2">Payment Proof:</p>
                  <div className="relative w-full max-w-md mx-auto sm:mx-0">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${selectedBooking.paymentProofUrl}`}
                      alt="Payment Proof"
                      className="w-full h-auto max-h-64 object-contain rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${selectedBooking.paymentProofUrl}`, '_blank')}
                    />
                    <p className="text-xs text-gray-500 mt-1 text-center sm:text-left">Click image to view full size</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Link
                href={`/chat`}
                className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                Open chat
              </Link>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium">Status</label>
              <select
                value={actionForm.status}
                onChange={(e) => setActionForm({ ...actionForm, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {actionForm.status === 'accepted' && (
                <>
                  <input
                    type="date"
                    value={actionForm.assignedDate}
                    onChange={(e) => setActionForm({ ...actionForm, assignedDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      value={actionForm.assignedTime}
                      onChange={(e) => setActionForm({ ...actionForm, assignedTime: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                    <select
                      value={actionForm.timePeriod}
                      onChange={(e) =>
                        setActionForm({ ...actionForm, timePeriod: e.target.value as 'AM' | 'PM' })
                      }
                      className="w-full px-3 py-2 border rounded-xl"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                  <select
                    value={actionForm.doctorId}
                    onChange={(e) => setActionForm({ ...actionForm, doctorId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="">Select doctor</option>
                    {doctors.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.fullName} — {d.specialization}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {actionForm.status === 'rejected' && (
                <textarea
                  placeholder="Rejection reason"
                  value={actionForm.rejectionReason}
                  onChange={(e) => setActionForm({ ...actionForm, rejectionReason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  rows={2}
                />
              )}

              <textarea
                placeholder="Admin notes (optional)"
                value={actionForm.adminNotes}
                onChange={(e) => setActionForm({ ...actionForm, adminNotes: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
                rows={2}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 py-2 border rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleBookingAction}
                className="flex-1 py-2 bg-blue-500 text-white rounded-xl font-medium"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
