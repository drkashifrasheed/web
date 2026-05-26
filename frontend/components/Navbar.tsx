'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  User,
  Calendar,
  MessageSquare,
  Bell,
  LogOut,
  Home,
  Info,
  Stethoscope,
  ChevronDown,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn, getInitials } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/about', label: 'About', icon: Info },
  { href: '/booking', label: 'Book', icon: Calendar },
]

const authLinks = [
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/booking', label: 'Bookings', icon: Calendar },
  { href: '/chat', label: 'Messages', icon: MessageSquare },
  { href: '/notifications', label: 'Alerts', icon: Bell },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsProfileOpen(false)
  }, [pathname])

  const isActive = (href: string) => pathname === href

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 safe-top',
          isScrolled || isMobileMenuOpen
            ? 'bg-white/95 backdrop-blur-lg shadow-md border-b border-gray-100'
            : 'bg-white/80 backdrop-blur-md sm:bg-transparent sm:backdrop-blur-none sm:shadow-none sm:border-none'
        )}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-xl font-bold gradient-text truncate">Dr Mahar</h1>
                <p className="text-[10px] sm:text-xs text-gray-500 -mt-0.5 truncate hidden min-[380px]:block">
                  Kashif Rasheed
                </p>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/notifications"
                    className="btn-touch relative p-2 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                  </Link>

                  <div className="relative hidden sm:block">
                    <button
                      type="button"
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 min-h-[44px]"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                        {user?.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getInitials(user?.fullName || 'U')
                        )}
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsProfileOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                          >
                            <div className="px-4 py-3 border-b border-gray-100">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.fullName}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                            {authLinks.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsProfileOpen(false)}
                                className={cn(
                                  'flex items-center gap-3 px-4 py-3 text-sm',
                                  isActive(link.href)
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                )}
                              >
                                <link.icon className="w-4 h-4" />
                                {link.label}
                              </Link>
                            ))}
                            <div className="border-t border-gray-100 mt-1 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  logout()
                                  setIsProfileOpen(false)
                                }}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full"
                              >
                                <LogOut className="w-4 h-4" />
                                Logout
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 min-h-[44px] flex items-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg shadow-sm min-h-[44px] flex items-center"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden btn-touch p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl flex flex-col safe-top safe-bottom"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="font-semibold text-gray-900">Menu</span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-touch p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {isAuthenticated && (
                  <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(user?.fullName || 'U')
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{user?.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium min-h-[48px]',
                        isActive(link.href)
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <link.icon className="w-5 h-5 flex-shrink-0" />
                      {link.label}
                    </Link>
                  ))}
                </div>

                {isAuthenticated && (
                  <div className="mt-6 pt-6 border-t border-gray-100 space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-2 mb-2">
                      Account
                    </p>
                    {authLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium min-h-[48px]',
                          isActive(link.href)
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        <link.icon className="w-5 h-5" />
                        {link.label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        logout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 w-full min-h-[48px]"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="mt-6 space-y-3">
                    <Link
                      href="/login"
                      className="flex items-center justify-center w-full px-4 py-3.5 rounded-xl text-base font-medium text-gray-700 border-2 border-gray-200 min-h-[48px]"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center justify-center w-full px-4 py-3.5 rounded-xl text-base font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-400 min-h-[48px]"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
