import axios from 'axios'
import { ApiResponse, User, Booking, Message, Notification, LoginCredentials, RegisterCredentials, Conversation, DashboardStats } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const path = typeof window !== 'undefined' ? window.location.pathname : ''
    const isAuthPage =
      path.startsWith('/login') ||
      path.startsWith('/register') ||
      path.startsWith('/verify-otp') ||
      path.startsWith('/admin/login')

    const isAdminArea =
      path.startsWith('/secure-admin-dashboard') || path.startsWith('/admin')

    if (status === 401 && !isAuthPage) {
      localStorage.removeItem('token')
      window.location.href = isAdminArea ? '/admin/login' : '/login'
    }

    if (status === 403 && path.startsWith('/secure-admin-dashboard')) {
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  // Legacy login - will be replaced by OTP flow
  login: (credentials: LoginCredentials) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials),

  // Step 1: Send login OTP after credentials verification
  sendLoginOTP: (credentials: LoginCredentials) =>
    api.post<ApiResponse<{ email: string; expiresIn: number; requiresOTP: boolean }>>('/auth/send-login-otp', credentials),

  // Step 2: Verify login OTP
  verifyLoginOTP: (data: { email: string; otp: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/verify-login', data),

  // Resend login OTP
  resendLoginOTP: (data: { email: string }) =>
    api.post<ApiResponse<{ email: string; expiresIn: number }>>('/auth/resend-login-otp', data),

  // Change password
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<ApiResponse<void>>('/auth/change-password', data),

  // Profile update with OTP
  sendProfileUpdateOTP: (data: { email?: string }) =>
    api.post<ApiResponse<{ email: string; expiresIn: number }>>('/auth/send-profile-update-otp', data),

  verifyProfileUpdateOTP: (data: { email?: string; otp: string; data: any }) =>
    api.post<ApiResponse<{ user: User }>>('/auth/verify-profile-update', data),

  // Delete account with OTP
  sendDeleteAccountOTP: () =>
    api.post<ApiResponse<{ email: string; expiresIn: number }>>('/auth/send-delete-account-otp'),

  verifyDeleteAccount: (data: { otp: string }) =>
    api.post<ApiResponse<void>>('/auth/verify-delete-account', data),

  // Legacy register - will be replaced by OTP flow
  register: (credentials: RegisterCredentials) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', credentials),

  // Step 1: Send verification OTP for registration
  sendVerificationOTP: (credentials: RegisterCredentials) =>
    api.post<ApiResponse<{ email: string; expiresIn: number }>>('/auth/send-verification-otp', credentials),

  // Step 2: Verify email and complete registration
  verifyEmail: (data: { email: string; otp: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/verify-email', data),

  // Resend verification OTP
  resendVerificationOTP: (data: { email: string }) =>
    api.post<ApiResponse<{ email: string; expiresIn: number }>>('/auth/resend-verification-otp', data),

  getMe: () =>
    api.get<ApiResponse<{ user: User }>>('/auth/me'),

  getAdminContact: () =>
    api.get<ApiResponse<{ admin: User }>>('/auth/admin-contact'),

  googleLogin: () => {
    window.location.href = `${API_URL}/auth/google`
  }
}

// User API
export const userApi = {
  getProfile: () =>
    api.get<ApiResponse<{ user: User }>>('/users/profile'),

  updateProfile: (data: Partial<User>) =>
    api.put<ApiResponse<{ user: User }>>('/users/profile', data),

  updateProfileImage: (formData: FormData) =>
    api.put<ApiResponse<{ user: User }>>('/users/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  getDashboard: () =>
    api.get<ApiResponse<{
      upcomingAppointments: Booking[]
      stats: {
        total: number
        pending: number
        accepted: number
        completed: number
        rejected: number
      }
      recentBookings: Booking[]
    }>>('/users/dashboard'),

  getDoctors: (params?: { search?: string; specialization?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ doctors: User[]; totalPages: number; currentPage: number; total: number }>>('/users/doctors', { params }),

  getDoctor: (id: string) =>
    api.get<ApiResponse<{ doctor: User }>>(`/users/doctors/${id}`),

  deleteAccount: () =>
    api.delete<ApiResponse<void>>('/users/account'),

  // Admin only
  getAllUsers: (params?: { role?: string; search?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ users: User[]; totalPages: number; currentPage: number; total: number }>>('/users', { params }),

  createDoctor: (data: Partial<User> & { password?: string }) =>
    api.post<ApiResponse<{ doctor: User }>>('/users/doctors', data),

  updateUserStatus: (id: string, isActive: boolean) =>
    api.put<ApiResponse<{ user: User }>>(`/users/${id}/status`, { isActive })
}

// Booking API
export const bookingApi = {
  createBooking: (data: Partial<Booking>) =>
    api.post<
      ApiResponse<{
        booking: Booking
        payment?: {
          bankName: string
          accountTitle: string
          accountNumber: string
          amount: number
          instructions: string
        }
      }>
    >('/bookings', data),

  getBookings: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ bookings: Booking[]; totalPages: number; currentPage: number; total: number }>>('/bookings', { params }),

  getBooking: (id: string) =>
    api.get<ApiResponse<{ booking: Booking }>>(`/bookings/${id}`),

  updateStatus: (id: string, data: { status: string; assignedDate?: string; assignedTime?: string; timePeriod?: string; doctorId?: string; meetingLink?: string; adminNotes?: string; rejectionReason?: string }) =>
    api.put<ApiResponse<{ booking: Booking }>>(`/bookings/${id}/status`, data),

  addPrescription: (id: string, data: Partial<Booking['prescription']>) =>
    api.put<ApiResponse<{ booking: Booking }>>(`/bookings/${id}/prescription`, data),

  addReview: (id: string, data: { rating: number; review: string }) =>
    api.post<ApiResponse<{ booking: Booking }>>(`/bookings/${id}/review`, data),

  // Booking cancellation with OTP
  sendCancelOTP: (bookingId: string) =>
    api.post<ApiResponse<{ email: string; expiresIn: number }>>(`/bookings/${bookingId}/send-cancel-otp`),

  verifyCancelOTP: (bookingId: string, otp: string) =>
    api.post<ApiResponse<{ booking: Booking }>>(`/bookings/${bookingId}/verify-cancel-otp`, { otp }),

  getPaymentConfig: () =>
    api.get<ApiResponse<{
      bankName: string
      accountTitle: string
      accountNumber: string
      amount: number
      instructions: string
    }>>('/bookings/config/payment'),

  uploadPaymentProof: (bookingId: string, formData: FormData) =>
    api.post<ApiResponse<{ booking: Booking }>>(`/bookings/${bookingId}/payment-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  requestVideoCall: (bookingId: string) =>
    api.post<ApiResponse<{ booking: Booking }>>(`/bookings/${bookingId}/request-video-call`),

  acceptVideoCall: (bookingId: string) =>
    api.post<ApiResponse<{ booking: Booking; joinUrl: string }>>(`/bookings/${bookingId}/accept-video-call`),

  startVideoCall: (bookingId: string) =>
    api.post<ApiResponse<{ roomId: string; booking: Booking }>>(`/bookings/${bookingId}/start-video-call`),

  endVideoCall: (bookingId: string) =>
    api.post<ApiResponse<{ booking: Booking }>>(`/bookings/${bookingId}/end-video-call`)
}

// Notification API
export const notificationApi = {
  getNotifications: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api.get<ApiResponse<{ notifications: Notification[]; unreadCount: number; totalPages: number; currentPage: number; total: number }>>('/notifications', { params }),

  getUnreadCount: () =>
    api.get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count'),

  markAsRead: (id: string) =>
    api.put<ApiResponse<{ notification: Notification }>>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.put<ApiResponse<void>>('/notifications/read-all'),

  deleteNotification: (id: string) =>
    api.delete<ApiResponse<void>>(`/notifications/${id}`)
}

// Message API
export const messageApi = {
  getConversations: () =>
    api.get<ApiResponse<{ conversations: Conversation[] }>>('/messages/conversations'),

  getMessages: (userId: string, params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ messages: Message[]; otherUser: User }>>(`/messages/${userId}`, { params }),

  sendMessage: (
    userId: string,
    data: { content?: string; messageType?: string; bookingId?: string },
    file?: File
  ) => {
    if (file) {
      const fd = new FormData()
      if (data.content) fd.append('content', data.content)
      if (data.bookingId) fd.append('bookingId', data.bookingId)
      fd.append('image', file)
      return api.post<ApiResponse<{ message: Message }>>(`/messages/${userId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    return api.post<ApiResponse<{ message: Message }>>(`/messages/${userId}`, data)
  },

  markAsRead: (id: string) =>
    api.put<ApiResponse<{ message: Message }>>(`/messages/${id}/read`),

  editMessage: (id: string, content: string) =>
    api.put<ApiResponse<{ message: Message }>>(`/messages/${id}`, { content }),

  deleteMessage: (id: string) =>
    api.delete<ApiResponse<void>>(`/messages/${id}`)
}

// Admin API
export const adminApi = {
  getDashboard: () =>
    api.get<ApiResponse<{
      stats: DashboardStats
      bookingStatusStats: Array<{ _id: string; count: number }>
      bookingsTrend: Array<{ _id: string; count: number }>
      recentBookings: Booking[]
      recentUsers: User[]
    }>>('/admin/dashboard'),

  getAllBookings: (params?: { status?: string; date?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ bookings: Booking[]; totalPages: number; currentPage: number; total: number }>>('/admin/bookings', { params }),

  getAllUsers: (params?: { role?: string; isActive?: boolean; search?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ users: User[]; totalPages: number; currentPage: number; total: number }>>('/admin/users', { params }),

  sendBroadcastNotification: (data: { title: string; message: string; targetRole?: string; priority?: string }) =>
    api.post<ApiResponse<{ sentCount: number }>>('/admin/notifications/broadcast', data),

  getDoctors: () =>
    api.get<ApiResponse<{ doctors: User[] }>>('/admin/doctors'),

  getRecentMessages: (limit?: number) =>
    api.get<ApiResponse<{ messages: Message[] }>>('/admin/messages/recent', { params: { limit } })
}

export default api