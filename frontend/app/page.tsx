'use client'

import Link from 'next/link'
import { Stethoscope, Calendar, Video, MessageSquare, ArrowRight, CheckCircle2, Star, Phone, Mail, MapPin } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default function HomePage() {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-white page-content !pt-[calc(var(--nav-height)+var(--safe-top)+1rem)] sm:!pt-[calc(var(--nav-height-sm)+var(--safe-top)+1.5rem)] pb-10 sm:pb-16">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 rounded-full mb-4 sm:mb-6">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span className="text-xs sm:text-sm font-medium text-blue-700">Trusted Healthcare in Pakistan</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
                Expert Healthcare by <span className="text-blue-600">Dr. Mahar</span> Kashif Rasheed
              </h1>

              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-lg">
                Providing quality medical care with compassion and expertise. Book appointments, 
                video consultations, and get expert medical advice from the comfort of your home.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-10">
                <Link
                  href="/booking"
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 min-h-[48px] bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                >
                  <Calendar className="w-5 h-5" />
                  Book Appointment
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['A', 'B', 'C', 'D'].map((letter) => (
                      <div key={letter} className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                        {letter}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    <strong className="text-gray-900">50,000+</strong> patients
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                  <span className="ml-1 text-sm text-gray-900 font-semibold">4.9</span>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Dr. Mahar Kashif Rasheed</h3>
                  <p className="text-gray-500">Healthcare Professional</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Next Available</p>
                    <p className="text-sm text-gray-500">Today at 2:00 PM</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
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

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Patient Rating</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                      <span className="ml-1 text-sm font-semibold text-gray-900">4.9</span>
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

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '50,000+', label: 'Patients Treated' },
              { value: '15+', label: 'Years Experience' },
              { value: '4.9', label: 'Patient Rating' },
              { value: '98%', label: 'Satisfaction Rate' }
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Healthcare Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive medical care tailored to your needs. Choose the service that works best for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: 'Book Appointment',
                description: 'Schedule in-person consultations with Dr. Mahar at your preferred time.',
                features: ['In-person visits', 'Flexible scheduling', 'Instant confirmation'],
                color: 'blue',
                link: '/booking'
              },
              {
                icon: MessageSquare,
                title: 'Chat Support',
                description: 'Get quick answers to your health questions through messaging.',
                features: ['Quick responses', 'Medical queries', 'Health tips'],
                color: 'blue',
                link: '/chat'
              }
            ].map((service) => (
              <Link key={service.title} href={service.link}>
                <div className="group h-full bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                  <div className={`w-12 h-12 ${service.color === 'blue' ? 'bg-blue-100' : 'bg-orange-100'} rounded-lg flex items-center justify-center mb-4`}>
                    <service.icon className={`w-6 h-6 ${service.color === 'blue' ? 'text-blue-600' : 'text-orange-600'}`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 className={`w-4 h-4 ${service.color === 'blue' ? 'text-blue-500' : 'text-orange-500'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className={`inline-flex items-center gap-1 font-semibold ${service.color === 'blue' ? 'text-blue-600' : 'text-orange-600'}`}>
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Patients Choose Dr. Mahar
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                With over 15 years of medical experience, Dr. Mahar Kashif Rasheed has built 
                a reputation for excellence in patient care and medical expertise.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { title: 'Board Certified', desc: 'Certified healthcare professional with extensive training.' },
                  { title: 'Timely Care', desc: 'Minimal waiting periods with scheduled appointments.' },
                  { title: 'Patient First', desc: 'Personalized care for every patient.' },
                  { title: 'Modern Facilities', desc: 'State-of-the-art medical equipment.' }
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Learn More About Us
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Certified Excellence</h3>
                  <p className="text-gray-500">Recognized Medical Professional</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  'Pakistan Medical Association Member',
                  '15+ Years Clinical Experience',
                  'Advanced Medical Training',
                  'Patient-Centered Care Approach'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Patients Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real feedback from patients who have experienced our healthcare services.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Ahmed Khan',
                location: 'Lahore',
                content: 'Dr. Mahar provided excellent care for my condition. His attention to detail made all the difference.',
                treatment: 'General Consultation'
              },
              {
                name: 'Fatima Ali',
                location: 'Karachi',
                content: 'The video consultation was so convenient. I got my prescription without leaving home.',
                treatment: 'Video Consultation'
              },
              {
                name: 'Muhammad Hassan',
                location: 'Islamabad',
                content: 'Professional and knowledgeable. The booking system is easy to use and staff is helpful.',
                treatment: 'Health Checkup'
              }
            ].map((testimonial) => (
              <div key={testimonial.name} className="bg-gray-50 rounded-xl p-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-4">&ldquo;{testimonial.content}&rdquo;</p>
                
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location} • {testimonial.treatment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Book your appointment today and experience quality healthcare with Dr. Mahar Kashif Rasheed.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Book Appointment
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors border border-blue-400"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">Dr. Mahar</h3>
                  <p className="text-sm text-gray-400">Kashif Rasheed</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Providing quality healthcare services with compassion and expertise.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/booking" className="hover:text-white transition-colors">Book Appointment</Link></li>
                <li><Link href="/video-call" className="hover:text-white transition-colors">Video Consultation</Link></li>
                <li><Link href="/chat" className="hover:text-white transition-colors">Chat with Doctor</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/profile" className="hover:text-white transition-colors">Patient Portal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+92 300 1234567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>contact@drmahar.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Lahore, Pakistan</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 Dr. Mahar Kashif Rasheed. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
