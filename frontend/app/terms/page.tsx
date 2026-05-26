'use client'

import { motion } from 'framer-motion'
import { FileText, Scale, Shield, AlertCircle, CheckCircle, Clock, Users, Lock, Mail, Phone, Globe, ChevronRight, Stethoscope } from 'lucide-react'
import Link from 'next/link'

export default function TermsOfServicePage() {
  const sections = [
    {
      id: 'acceptance',
      icon: CheckCircle,
      title: 'Acceptance of Terms',
      content: `By accessing or using the Dr Mahar Kashif Rasheed Hospital Booking Platform ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.

These Terms constitute a legally binding agreement between you and Dr Mahar Kashif Rasheed Hospital ("we," "us," or "our") regarding your use of the Platform.`
    },
    {
      id: 'definitions',
      icon: FileText,
      title: 'Definitions',
      content: `For the purposes of these Terms:

• "Platform" refers to the Dr Mahar Kashif Rasheed Hospital Booking website, mobile applications, and related services.
• "User," "you," or "your" refers to any individual or entity accessing or using the Platform.
• "Patient" refers to a user seeking medical services through the Platform.
• "Doctor" or "Healthcare Provider" refers to licensed medical professionals registered on the Platform.
• "Service" refers to any feature, functionality, or offering available through the Platform.
• "Account" refers to your registered user profile on the Platform.`
    },
    {
      id: 'eligibility',
      icon: Users,
      title: 'Eligibility and Registration',
      content: `To use our services, you must:

• Be at least 18 years of age or have parental/guardian consent
• Have the legal capacity to enter into binding contracts
• Provide accurate, current, and complete information during registration
• Maintain and promptly update your account information
• Be responsible for all activities under your account

We reserve the right to suspend or terminate accounts that provide false information or violate these Terms.`
    },
    {
      id: 'services',
      icon: Stethoscope,
      title: 'Platform Services',
      content: `Our Platform provides the following services:

**Online Appointment Booking**
• Schedule appointments with qualified healthcare providers
• View available time slots and specialties
• Receive appointment confirmations and reminders

**Telemedicine Services**
• Video consultations with doctors
• Secure messaging with healthcare providers
• Online prescription services (where legally permitted)

**Medical Records**
• Secure storage of medical history
• Access to consultation notes and prescriptions
• Lab result tracking and management

**Additional Features**
• Real-time chat with medical staff
• Emergency contact services
• Health education resources`
    },
    {
      id: 'responsibilities',
      icon: Scale,
      title: 'User Responsibilities',
      content: `As a user of the Platform, you agree to:

**Account Security**
• Maintain the confidentiality of your account credentials
• Notify us immediately of any unauthorized access
• Use strong passwords and enable two-factor authentication
• Not share your account with others

**Accurate Information**
• Provide truthful and accurate medical history
• Update personal information promptly
• Verify your identity when requested
• Not impersonate others or provide false information

**Appropriate Use**
• Use the Platform for lawful purposes only
• Not interfere with other users' access
• Not attempt to breach security measures
• Not use automated systems to access the Platform
• Respect healthcare providers and staff`
    },
    {
      id: 'medical',
      icon: AlertCircle,
      title: 'Medical Disclaimer',
      content: `**Important Notice:**

The Platform is designed to facilitate access to healthcare services but does not provide medical advice directly. All medical decisions are made by qualified healthcare providers.

**Emergency Situations**
• For life-threatening emergencies, call your local emergency number (e.g., 112, 911, 999) immediately
• Do not rely solely on the Platform for emergency medical care
• The Platform is not a substitute for emergency medical services

**Limitations**
• Online consultations may not be appropriate for all medical conditions
• Some conditions require in-person examination
• Technical limitations may affect video consultation quality
• We do not guarantee specific medical outcomes

**Prescription Policy**
• Prescriptions are issued at the discretion of healthcare providers
• Controlled substances may not be prescribed through telemedicine
• Prescription policies comply with local regulations`
    },
    {
      id: 'privacy',
      icon: Lock,
      title: 'Privacy and Data Protection',
      content: `We are committed to protecting your privacy and personal information:

**Data Collection**
We collect information necessary to provide healthcare services, including:
• Personal identification information
• Medical history and health records
• Appointment and consultation data
• Payment information (processed securely)

**Data Usage**
Your information is used for:
• Providing healthcare services
• Appointment scheduling and management
• Communication with healthcare providers
• Improving our services
• Legal compliance

**Data Security**
• Industry-standard encryption protocols
• Secure servers and data centers
• Regular security audits
• Access controls and authentication
• HIPAA and GDPR compliance where applicable

For complete details, please review our Privacy Policy.`
    },
    {
      id: 'payments',
      icon: Globe,
      title: 'Fees and Payments',
      content: `**Consultation Fees**
• Fees for services are displayed before booking
• Payment is required to confirm appointments
• Fees may vary by doctor and service type

**Refund Policy**
• Cancellations made 24+ hours before appointment: Full refund
• Cancellations made less than 24 hours: Partial refund (50%)
• No-shows: No refund
• Technical issues preventing consultation: Full refund or rescheduling

**Payment Methods**
• Credit/Debit cards
• Digital wallets
• Bank transfers (where available)
• Insurance (participating providers)

**Billing Disputes**
Contact our billing department within 7 days of any billing concerns. We will investigate and resolve disputes promptly.`
    },
    {
      id: 'intellectual',
      icon: FileText,
      title: 'Intellectual Property',
      content: `All content on the Platform is protected by intellectual property laws:

**Our Rights**
• Platform design, logos, and branding
• Software code and algorithms
• Educational content and articles
• User interface and experience design
• Database structures and compilations

**User License**
We grant you a limited, non-exclusive, non-transferable license to use the Platform for personal, non-commercial purposes.

**Restrictions**
You may not:
• Copy, modify, or distribute Platform content
• Reverse engineer any part of the Platform
• Use our trademarks without permission
• Create derivative works from our content
• Scrape or data mine the Platform`
    },
    {
      id: 'termination',
      icon: Clock,
      title: 'Termination and Suspension',
      content: `We may suspend or terminate your access to the Platform:

**By Us**
• Violation of these Terms
• Fraudulent or illegal activity
• Non-payment of fees
• Extended periods of inactivity
• At our discretion with reasonable notice

**By You**
• You may delete your account at any time
• Outstanding fees must be settled before closure
• Medical records are retained per legal requirements

**Effects of Termination**
• Loss of access to services
• Cancellation of pending appointments
• Continued obligations regarding payment
• Survival of provisions regarding liability and dispute resolution`
    },
    {
      id: 'liability',
      icon: Shield,
      title: 'Limitation of Liability',
      content: `**Platform Liability**
To the maximum extent permitted by law:

• We are not liable for indirect, incidental, or consequential damages
• Our total liability is limited to fees paid in the 12 months preceding the claim
• We are not responsible for technical failures beyond our control
• We do not guarantee uninterrupted or error-free service

**Medical Liability**
• Healthcare providers are independent contractors
• Medical malpractice claims are directed to the provider
• We facilitate but do not control medical care
• Platform acts as a service connector, not a healthcare provider

**Force Majeure**
We are not liable for failures due to circumstances beyond our reasonable control, including natural disasters, wars, government actions, or internet outages.`
    },
    {
      id: 'disputes',
      icon: Scale,
      title: 'Dispute Resolution',
      content: `**Informal Resolution**
We encourage users to contact us first to resolve any disputes informally.

**Formal Dispute Resolution**
If informal resolution fails:

• Disputes will be resolved through binding arbitration
• Arbitration will be conducted in accordance with local arbitration laws
• Each party bears their own arbitration costs
• Class action waiver applies

**Governing Law**
These Terms are governed by the laws of Pakistan, without regard to conflict of law principles.

**Jurisdiction**
Any legal proceedings will be brought in the courts of Lahore, Pakistan.`
    },
    {
      id: 'changes',
      icon: Clock,
      title: 'Changes to Terms',
      content: `We may update these Terms periodically:

• Material changes will be notified via email or Platform notice
• Continued use after changes constitutes acceptance
• Changes become effective immediately upon posting unless stated otherwise
• We will indicate the effective date of the current Terms

**Notification**
• Email notification to registered users
• Notice on Platform login
• Update to "Last Updated" date

**Review**
We encourage you to review these Terms regularly to stay informed of any changes.`
    },
    {
      id: 'contact',
      icon: Mail,
      title: 'Contact Information',
      content: `For questions about these Terms, please contact us:

**Dr Mahar Kashif Rasheed Hospital**

📍 Address: [Hospital Address], Lahore, Pakistan

📧 Email: legal@drmaharkashifrasheed.com

📞 Phone: +92-XXX-XXXXXXX

🌐 Website: www.drmaharkashifrasheed.com

**Response Time**
We aim to respond to all inquiries within 2 business days.

**Legal Notices**
All legal notices should be sent to our registered address via certified mail.`
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-cyan-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6">
              <Scale className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Please read these terms carefully before using our healthcare platform
            </p>
            <p className="text-sm text-blue-200 mt-4">
              Last Updated: January 2024 | Effective Date: January 1, 2024
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Jump to:</span>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-600 rounded-full text-sm whitespace-nowrap transition-colors"
              >
                <section.icon className="w-3 h-3" />
                {section.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            id={section.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {section.title}
                  </h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
                </div>
              </div>
              <div className="prose prose-gray max-w-none ml-16">
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Agreement Section */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 text-white text-center"
        >
          <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-4">Agreement</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            By using the Dr Mahar Kashif Rasheed Hospital Booking Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/privacy"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            >
              <Shield className="w-5 h-5" />
              View Privacy Policy
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            >
              <Stethoscope className="w-5 h-5" />
              Return to Home
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer Note */}
      <section className="max-w-5xl mx-auto px-4 pb-12 text-center">
        <p className="text-sm text-gray-500">
          These Terms of Service are subject to change. Please review periodically for updates.
        </p>
      </section>
    </div>
  )
}
