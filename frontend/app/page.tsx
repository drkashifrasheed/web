'use client'

import Link from 'next/link'
import {
  Stethoscope,
  Calendar,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Star,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react'

import Navbar from '@/components/Navbar'

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* HERO SECTION */}
      <section className="bg-white page-content !pt-[calc(var(--nav-height)+var(--safe-top)+1rem)] sm:!pt-[calc(var(--nav-height-sm)+var(--safe-top)+1.5rem)] pb-10 sm:pb-16">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">

            {/* LEFT SIDE */}
            <div className="order-2 lg:order-1">

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-6">
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                <span className="text-sm font-medium text-blue-700">
                  Trusted Healthcare in Pakistan
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Expert Healthcare by{' '}
                <span className="text-blue-600">Dr. Mahar</span> Kashif Rasheed
              </h1>

              <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-xl">
                Providing quality medical care with compassion and expertise.
                Book appointments, video consultations, and get expert medical
                advice from the comfort of your home.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link
                  href="/booking"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  Book Appointment
                </Link>

                <Link
                  href="/chat"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  Chat Now
                </Link>
              </div>

              {/* STATS */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">

                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['A', 'B', 'C', 'D'].map((letter) => (
                      <div
                        key={letter}
                        className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                      >
                        {letter}
                      </div>
                    ))}
                  </div>

                  <span className="text-sm text-gray-600">
                    <strong className="text-gray-900">50,000+</strong> patients
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                  <span className="ml-1 text-sm font-semibold text-gray-900">
                    4.9
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE CARD */}
            <div className="order-1 lg:order-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">

              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-7 h-7 text-white" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Dr. Mahar Kashif Rasheed
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Healthcare Professional
                  </p>
                </div>
              </div>

              <div className="space-y-4">

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Next Available
                    </p>
                    <p className="text-sm text-gray-500">
                      Today at 2:00 PM
                    </p>
                  </div>

                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                    Open
                  </span>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>

                  <div>
                    <p className="font-medium text-gray-900">Chat Support</p>
                    <p className="text-sm text-gray-500">24/7 available</p>
                  </div>
                </div>

              </div>

              <div className="mt-6 pt-6 border-t">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Patient Rating</p>

                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                      <span className="ml-1 text-sm font-semibold">
                        4.9
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">50k+</p>
                    <p className="text-sm text-gray-500">Patients</p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Our Healthcare Services
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              Comprehensive medical care tailored to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* Appointment */}
            <Link href="/booking">
              <div className="bg-white p-6 rounded-xl border hover:shadow-lg transition">
                <Calendar className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Book Appointment</h3>
                <p className="text-gray-600 mb-4">
                  Schedule in-person consultations easily.
                </p>

                <div className="flex items-center text-blue-600 font-semibold">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </Link>

            {/* Chat */}
            <Link href="/chat">
              <div className="bg-white p-6 rounded-xl border hover:shadow-lg transition">
                <MessageSquare className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Chat Support</h3>
                <p className="text-gray-600 mb-4">
                  Ask medical questions anytime.
                </p>

                <div className="flex items-center text-blue-600 font-semibold">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Take Control of Your Health?
        </h2>
        <p className="mb-6 text-blue-100">
          Book your appointment today.
        </p>

        <Link
          href="/booking"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg"
        >
          <Calendar className="w-5 h-5" />
          Book Now
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          © 2026 Dr. Mahar Kashif Rasheed. All rights reserved.
        </div>
      </footer>
    </>
  )
}
