import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthState } from '@/types'
import { authApi, userApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface OTPState {
  email: string
  otpType: 'login' | 'register' | null
  expiresIn: number
  tempCredentials: {
    fullName?: string
    email?: string
    password?: string
    phoneNumber?: string
  } | null
}

interface AuthStore extends AuthState {
  otpState: OTPState

  // Legacy methods
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string, phoneNumber?: string) => Promise<void>

  // OTP methods
  sendLoginOTP: (email: string, password: string) => Promise<boolean>
  verifyLoginOTP: (otp: string) => Promise<User>
  resendLoginOTP: () => Promise<void>

  sendRegisterOTP: (fullName: string, email: string, password: string, phoneNumber?: string) => Promise<boolean>
  verifyRegisterOTP: (otp: string) => Promise<void>
  resendRegisterOTP: () => Promise<void>

  clearOTPState: () => void

  logout: () => void
  loadUser: () => Promise<void>
  updateUser: (user: User) => void
  setLoading: (loading: boolean) => void
}

// Safe localStorage access
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key)
    }
    return null
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value)
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false, // Start as false for SSR safety
      otpState: {
        email: '',
        otpType: null,
        expiresIn: 600,
        tempCredentials: null
      },

      // Legacy login - kept for compatibility
      login: async (email: string, password: string) => {
        try {
          const response = await authApi.login({ email, password })
          const { user, token } = response.data.data

          safeLocalStorage.setItem('token', token)
          set({ user, token, isAuthenticated: true, isLoading: false })
          toast.success('Login successful!')
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Login failed')
          throw error
        }
      },

      // Step 1: Send OTP for login
      sendLoginOTP: async (email: string, password: string) => {
        try {
          const response = await authApi.sendLoginOTP({ email, password })
          const { email: responseEmail, expiresIn, requiresOTP } = response.data.data

          if (requiresOTP) {
            set({
              otpState: {
                email: responseEmail,
                otpType: 'login',
                expiresIn,
                tempCredentials: { email, password }
              }
            })
            toast.success('Verification code sent to your email!')
            return true
          }
          return false
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to send verification code')
          throw error
        }
      },

      // Step 2: Verify OTP and complete login
      verifyLoginOTP: async (otp: string) => {
        try {
          const { otpState } = get()
          if (!otpState.email) {
            throw new Error('No pending verification')
          }

          const response = await authApi.verifyLoginOTP({
            email: otpState.email,
            otp
          })

          const { user, token } = response.data.data

          console.log('AuthStore - Saving token to localStorage')
          safeLocalStorage.setItem('token', token)
          console.log('AuthStore - Token saved, verifying:', safeLocalStorage.getItem('token') ? 'exists' : 'missing')

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            otpState: {
              email: '',
              otpType: null,
              expiresIn: 600,
              tempCredentials: null
            }
          })
          toast.success('Login successful!')

          // Return user data for immediate use
          return user
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Invalid verification code')
          throw error
        }
      },

      // Resend login OTP
      resendLoginOTP: async () => {
        try {
          const { otpState } = get()
          if (!otpState.email) {
            throw new Error('No pending verification')
          }

          const response = await authApi.resendLoginOTP({ email: otpState.email })
          const { expiresIn } = response.data.data

          set(state => ({
            otpState: {
              ...state.otpState,
              expiresIn
            }
          }))
          toast.success('New verification code sent!')
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to resend code')
          throw error
        }
      },

      // Legacy register - kept for compatibility
      register: async (fullName: string, email: string, password: string, phoneNumber?: string) => {
        try {
          const response = await authApi.register({ fullName, email, password, phoneNumber })
          const { user, token } = response.data.data

          safeLocalStorage.setItem('token', token)
          set({ user, token, isAuthenticated: true, isLoading: false })
          toast.success('Registration successful!')
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Registration failed')
          throw error
        }
      },

      // Step 1: Send OTP for registration
      sendRegisterOTP: async (fullName: string, email: string, password: string, phoneNumber?: string) => {
        try {
          console.log('Sending OTP request to backend...', { fullName, email, phoneNumber })
          const response = await authApi.sendVerificationOTP({ fullName, email, password, phoneNumber })
          console.log('OTP response:', response.data)
          const { email: responseEmail, expiresIn } = response.data.data

          set({
            otpState: {
              email: responseEmail,
              otpType: 'register',
              expiresIn,
              tempCredentials: { fullName, email, password, phoneNumber }
            }
          })
          toast.success('Verification code sent to your email!')
          return true
        } catch (error: any) {
          console.error('OTP Error:', error)
          console.error('Error response:', error.response?.data)
          console.error('Error message:', error.message)
          toast.error(error.response?.data?.message || error.message || 'Failed to send verification code')
          throw error
        }
      },

      // Step 2: Verify OTP and complete registration
      verifyRegisterOTP: async (otp: string) => {
        try {
          const { otpState } = get()
          if (!otpState.email) {
            throw new Error('No pending verification')
          }

          const response = await authApi.verifyEmail({
            email: otpState.email,
            otp
          })

          const { user, token } = response.data.data

          safeLocalStorage.setItem('token', token)
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            otpState: {
              email: '',
              otpType: null,
              expiresIn: 600,
              tempCredentials: null
            }
          })
          toast.success('Email verified! Registration complete!')
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Invalid verification code')
          throw error
        }
      },

      // Resend registration OTP
      resendRegisterOTP: async () => {
        try {
          const { otpState } = get()
          if (!otpState.email) {
            throw new Error('No pending verification')
          }

          const response = await authApi.resendVerificationOTP({ email: otpState.email })
          const { expiresIn } = response.data.data

          set(state => ({
            otpState: {
              ...state.otpState,
              expiresIn
            }
          }))
          toast.success('New verification code sent!')
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to resend code')
          throw error
        }
      },

      // Clear OTP state
      clearOTPState: () => {
        set({
          otpState: {
            email: '',
            otpType: null,
            expiresIn: 600,
            tempCredentials: null
          }
        })
      },

      logout: () => {
        safeLocalStorage.removeItem('token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          otpState: {
            email: '',
            otpType: null,
            expiresIn: 600,
            tempCredentials: null
          }
        })
        toast.success('Logged out successfully')
      },

      loadUser: async () => {
        // Only run on client side
        if (typeof window === 'undefined') {
          set({ isLoading: false, isAuthenticated: false })
          return
        }

        const token = safeLocalStorage.getItem('token')
        console.log('AuthStore loadUser - Token:', token ? 'exists' : 'missing')

        if (!token) {
          set({ isLoading: false, isAuthenticated: false })
          return
        }

        set({ isLoading: true })

        try {
          const response = await userApi.getProfile()
          console.log('AuthStore loadUser - Profile response:', response.data.data.user)
          set({
            user: response.data.data.user,
            token,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error: any) {
          const status = error.response?.status
          // Keep session on temporary DB/server errors; only clear on auth failure
          if (status === 401 || status === 403) {
            safeLocalStorage.removeItem('token')
            set({ user: null, token: null, isAuthenticated: false, isLoading: false })
          } else {
            const persisted = get()
            set({
              isAuthenticated: !!(persisted.token && persisted.user),
              isLoading: false
            })
            if (status === 503) {
              toast.error('Server is starting up. Please try again.')
            }
          }
        }
      },

      updateUser: (user: User) => {
        set({ user })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        otpState: state.otpState
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<AuthStore> | undefined
        const token = saved?.token ?? current.token
        return {
          ...current,
          ...saved,
          isAuthenticated: saved?.isAuthenticated ?? !!token,
          isLoading: false // Always false after merge for SSR safety
        }
      }
    }
  )
)
