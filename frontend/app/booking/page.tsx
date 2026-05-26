'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, User, Phone, MapPin, FileText, Clock, ChevronRight, CheckCircle, ArrowLeft } from 'lucide-react'
import { bookingApi } from '@/lib/api'
import Navbar from '@/components/Navbar'

export default function BookingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<{
    bankName: string
    accountTitle: string
    accountNumber: string
    amount: number
    instructions: string
  } | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [uploadingProof, setUploadingProof] = useState(false)
  const [formData, setFormData] = useState({
    patientInfo: {
      fullName: '',
      age: '',
      weight: '',
      gender: '',
      phoneNumber: '',
      location: '',
      allergies: '',
      medicalHistory: '',
      currentMedications: ''
    },
    medicalProblem: '',
    symptoms: [] as string[],
    appointmentType: 'in-person',
    preferredTime: '',
    additionalNotes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await bookingApi.createBooking({
        ...formData,
        appointmentType: formData.appointmentType as 'in-person' | 'video-consultation' | 'phone-consultation',
        patientInfo: {
          ...formData.patientInfo,
          age: parseInt(formData.patientInfo.age, 10) || 0,
          weight: formData.patientInfo.weight
            ? parseFloat(formData.patientInfo.weight)
            : undefined
        }
      })
      setCreatedBookingId(res.data.data.booking._id)
      setPaymentInfo(res.data.data.payment ?? null)
      setStep(3)
    } catch (error) {
      console.error('Booking error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updatePatientInfo = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      patientInfo: { ...prev.patientInfo, [field]: value }
    }))
  }

  return (
    <>
      <Navbar />
      <div className="page-shell bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="page-content-tight">
          {/* Back Button */}
          <motion.button
            type="button"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 sm:mb-6 transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 px-4 sm:px-8 py-5 sm:py-6">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Book an Appointment</h1>
              <p className="text-blue-100 mt-1 text-sm sm:text-base">Fill in your details to schedule a consultation</p>
            </div>

            {/* Progress Steps */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 overflow-x-auto no-scrollbar">
              <div className="flex items-center justify-between min-w-[280px] sm:min-w-0">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div className={`
                      w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0
                      ${step >= s ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}
                    `}>
                      {step > s ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : s}
                    </div>
                    {s < 3 && (
                      <div className={`flex-1 h-1 mx-1 sm:mx-2 min-w-[24px] ${step > s ? 'bg-blue-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] sm:text-sm text-gray-500 gap-1">
                <span>Personal Info</span>
                <span>Medical Details</span>
                <span>Confirmation</span>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.patientInfo.fullName}
                          onChange={(e) => updatePatientInfo('fullName', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age *
                      </label>
                      <input
                        type="number"
                        value={formData.patientInfo.age}
                        onChange={(e) => updatePatientInfo('age', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Enter your age"
                        required
                        min="0"
                        max="150"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={formData.patientInfo.weight}
                        onChange={(e) => updatePatientInfo('weight', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Enter your weight"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        value={formData.patientInfo.gender}
                        onChange={(e) => updatePatientInfo('gender', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.patientInfo.phoneNumber}
                          onChange={(e) => updatePatientInfo('phoneNumber', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.patientInfo.location}
                          onChange={(e) => updatePatientInfo('location', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Enter your city/location"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setStep(2)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                      Next Step
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900">Medical Information</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Problem / Reason for Visit *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <textarea
                        value={formData.medicalProblem}
                        onChange={(e) => setFormData({ ...formData, medicalProblem: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]"
                        placeholder="Describe your medical problem or symptoms..."
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Type *
                    </label>
                    <div className="grid md:grid-cols-3 gap-4">
                      {['in-person', 'video-consultation', 'phone-consultation'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, appointmentType: type })}
                          className={`p-4 border-2 rounded-xl text-left transition-all ${
                            formData.appointmentType === type
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="font-medium text-gray-900 capitalize">
                            {type.replace('-', ' ')}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {type === 'in-person' && 'Visit the clinic'}
                            {type === 'video-consultation' && 'Video call with doctor'}
                            {type === 'phone-consultation' && 'Phone consultation'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      >
                        <option value="">Select preferred time</option>
                        <option value="morning">Morning (9:00 AM - 12:00 PM)</option>
                        <option value="afternoon">Afternoon (12:00 PM - 3:00 PM)</option>
                        <option value="evening">Evening (3:00 PM - 6:00 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergies (optional)
                    </label>
                    <textarea
                      value={formData.patientInfo.allergies}
                      onChange={(e) => updatePatientInfo('allergies', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                      placeholder="e.g. Penicillin, peanuts"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical history (optional)
                    </label>
                    <textarea
                      value={formData.patientInfo.medicalHistory}
                      onChange={(e) => updatePatientInfo('medicalHistory', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                      placeholder="Past conditions, surgeries, ongoing treatments..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current medications (optional)
                    </label>
                    <textarea
                      value={formData.patientInfo.currentMedications}
                      onChange={(e) => updatePatientInfo('currentMedications', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                      placeholder="e.g. Aspirin, blood pressure medicine"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={formData.additionalNotes}
                      onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                      placeholder="Any additional information you'd like to share..."
                    />
                  </div>

                  <p className="text-sm text-gray-500">
                    This medical information is saved only with this booking request, not on your profile.
                  </p>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Booking'}
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 max-w-lg mx-auto"
                >
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Submitted — Pending</h2>
                    <p className="text-gray-600">
                      Status: <strong className="text-yellow-600">Pending</strong>. Admin will review after payment proof.
                    </p>
                  </div>

                  {paymentInfo && (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6 text-left">
                      <h3 className="font-semibold text-gray-900 mb-3">Payment details</h3>
                      <p className="text-sm text-gray-600 mb-4">{paymentInfo.instructions}</p>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Bank</dt>
                          <dd className="font-medium">{paymentInfo.bankName}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Account title</dt>
                          <dd className="font-medium">{paymentInfo.accountTitle}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Account number</dt>
                          <dd className="font-mono font-bold text-blue-700">{paymentInfo.accountNumber}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Amount (PKR)</dt>
                          <dd className="font-bold">{paymentInfo.amount}</dd>
                        </div>
                      </dl>
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload payment proof (screenshot)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      className="w-full text-sm"
                    />
                    <button
                      type="button"
                      disabled={!proofFile || !createdBookingId || uploadingProof}
                      onClick={async () => {
                        if (!proofFile || !createdBookingId) return
                        setUploadingProof(true)
                        try {
                          const fd = new FormData()
                          fd.append('proof', proofFile)
                          await bookingApi.uploadPaymentProof(createdBookingId, fd)
                          alert('Payment proof uploaded! Admin will verify.')
                        } catch {
                          alert('Upload failed')
                        } finally {
                          setUploadingProof(false)
                        }
                      }}
                      className="mt-3 w-full py-3 bg-green-600 text-white rounded-xl font-medium disabled:opacity-50"
                    >
                      {uploadingProof ? 'Uploading...' : 'Submit payment proof'}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => router.push('/profile')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                      View in Profile
                    </button>
                    <button
                      onClick={() => {
                        setStep(1)
                        setFormData({
                          patientInfo: {
                            fullName: '',
                            age: '',
                            weight: '',
                            gender: '',
                            phoneNumber: '',
                            location: '',
                            allergies: '',
                            medicalHistory: '',
                            currentMedications: ''
                          },
                          medicalProblem: '',
                          symptoms: [],
                          appointmentType: 'in-person',
                          preferredTime: '',
                          additionalNotes: ''
                        })
                      }}
                      className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                    >
                      Book Another
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
