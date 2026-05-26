'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Stethoscope,
  Award,
  Users,
  Heart,
  Clock,
  Shield,
  CheckCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ArrowLeft
} from 'lucide-react'
import Navbar from '@/components/Navbar'

const stats = [
  { icon: Users, value: '50,000+', label: 'Patients Treated' },
  { icon: Award, value: '15+', label: 'Years Experience' },
  { icon: Star, value: '4.9', label: 'Patient Rating' },
  { icon: Heart, value: '98%', label: 'Satisfaction Rate' }
]

const values = [
  {
    icon: Heart,
    title: 'Patient-Centered Care',
    description: 'We put our patients first, ensuring personalized treatment plans tailored to individual needs.'
  },
  {
    icon: Shield,
    title: 'Medical Excellence',
    description: 'Our team maintains the highest standards of medical practice with continuous learning.'
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Round-the-clock medical support for emergencies and urgent consultations.'
  },
  {
    icon: Users,
    title: 'Expert Team',
    description: 'A team of highly qualified doctors and healthcare professionals at your service.'
  }
]

const achievements = [
  'Best Healthcare Provider Award 2024',
  'ISO 9001:2015 Certified',
  'Member of Pakistan Medical Association',
  'Telemedicine Excellence Award',
  'Patient Safety Certification'
]

export default function AboutPage() {
  const router = useRouter()
  
  return (
    <>
      <Navbar />
      <div className="page-shell bg-gradient-to-b from-white via-blue-50/30 to-white">
        <div className="page-content max-w-7xl">
          <motion.button
            type="button"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </motion.button>
        </div>

        {/* Hero Section */}
        <section className="relative py-10 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mb-8 shadow-lg shadow-blue-500/25"
              >
                <Stethoscope className="w-10 h-10 text-white" />
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                About <span className="gradient-text">Dr Mahar</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Dedicated to providing exceptional healthcare services with compassion, 
                expertise, and cutting-edge technology. Your health is our mission.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl mb-4"
                  >
                    <stat.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Doctor Profile Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <div className="text-center text-white p-8">
                      <Stethoscope className="w-32 h-32 mx-auto mb-6 opacity-80" />
                      <h3 className="text-3xl font-bold mb-2">Dr. Mahar Kashif Rasheed</h3>
                      <p className="text-xl opacity-90">Senior Consultant</p>
                    </div>
                  </div>
                </motion.div>
                
                {/* Decorative elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h2 className="text-4xl font-bold text-gray-900">
                  Meet Your <span className="gradient-text">Trusted Doctor</span>
                </h2>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  Dr. Mahar Kashif Rasheed is a highly experienced medical professional with over 
                  15 years of dedicated service in healthcare. Specializing in comprehensive patient 
                  care, Dr. Rasheed combines traditional medical expertise with modern telemedicine 
                  solutions.
                </p>

                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{achievement}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl text-white mt-8"
                >
                  <h3 className="text-xl font-semibold mb-2">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {['General Medicine', 'Telemedicine', 'Preventive Care', 'Chronic Disease Management'].map((spec) => (
                      <span key={spec} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The principles that guide our commitment to exceptional healthcare
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300"
                >
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-shadow"
                  >
                    <value.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-12 text-white text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience Better Healthcare?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Book your appointment today and take the first step towards better health
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Phone className="w-7 h-7" />
                  </div>
                  <p className="font-semibold">+92 300 1234567</p>
                  <p className="text-blue-200 text-sm">24/7 Helpline</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Mail className="w-7 h-7" />
                  </div>
                  <p className="font-semibold">contact@drmahar.com</p>
                  <p className="text-blue-200 text-sm">Email Us</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <p className="font-semibold">Lahore, Pakistan</p>
                  <p className="text-blue-200 text-sm">Main Clinic</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}
