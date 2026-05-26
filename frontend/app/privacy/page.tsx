'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Database, Share2, Cookie, UserCheck, Clock, Globe, Mail, Phone, ChevronRight, Stethoscope, FileText, Server, Trash2, Bell } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: 'introduction',
      icon: Shield,
      title: 'Introduction',
      content: `Dr Mahar Kashif Rasheed Hospital ("we," "us," or "our") is committed to protecting your privacy and ensuring the security of your personal and health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Hospital Booking Platform ("Platform").

We comply with applicable data protection laws, including the General Data Protection Regulation (GDPR) where applicable, and maintain standards that meet or exceed healthcare privacy requirements.

By using our Platform, you consent to the practices described in this Privacy Policy. If you do not agree with this policy, please do not use our services.`
    },
    {
      id: 'information-collected',
      icon: Database,
      title: 'Information We Collect',
      content: `**Personal Information**
We collect information that you provide directly to us:

• **Identity Information:** Full name, date of birth, gender, national ID number
• **Contact Information:** Email address, phone number, home address
• **Account Information:** Username, password, security questions
• **Payment Information:** Credit/debit card details, billing address (processed securely)
• **Emergency Contacts:** Name, relationship, phone number of emergency contacts

**Health Information**
As a healthcare platform, we collect sensitive medical information:

• **Medical History:** Past illnesses, surgeries, allergies, chronic conditions
• **Current Symptoms:** Description of current health concerns
• **Medications:** Current prescriptions, dosages, and schedules
• **Lab Results:** Test results, imaging reports, diagnostic data
• **Consultation Records:** Notes from doctor appointments, treatment plans
• **Vital Statistics:** Blood pressure, heart rate, weight, height (when provided)

**Technical Information**
We automatically collect certain information when you use our Platform:

• **Device Information:** IP address, browser type, operating system, device model
• **Usage Data:** Pages visited, time spent, features used, click patterns
• **Location Data:** General geographic location (city/region level)
• **Cookies and Similar Technologies:** Session data, preferences, authentication tokens
• **Communication Data:** Chat messages, video call metadata, email correspondence`
    },
    {
      id: 'how-we-use',
      icon: Eye,
      title: 'How We Use Your Information',
      content: `**Primary Purposes**
We use your information to:

• **Provide Healthcare Services:** Connect you with healthcare providers, schedule appointments, facilitate consultations
• **Medical Records Management:** Maintain accurate and complete health records
• **Treatment Coordination:** Share necessary information with your healthcare team
• **Prescription Management:** Process and track prescription orders
• **Emergency Response:** Contact emergency services or your emergency contacts when necessary

**Operational Purposes**
• **Account Management:** Create and maintain your user account
• **Authentication:** Verify your identity and secure your account
• **Communication:** Send appointment reminders, health tips, service updates
• **Customer Support:** Respond to inquiries and resolve technical issues
• **Quality Improvement:** Analyze usage patterns to improve our services

**Legal and Safety Purposes**
• **Legal Compliance:** Meet regulatory requirements, respond to legal requests
• **Fraud Prevention:** Detect and prevent unauthorized access or fraudulent activity
• **Public Health:** Participate in disease surveillance and public health initiatives (anonymized data only)
• **Safety:** Protect the safety of our users, staff, and the public

**With Your Consent**
• **Marketing Communications:** Send promotional materials (only with explicit opt-in)
• **Research:** Participate in medical research studies (anonymized and with consent)
• **Third-Party Services:** Share with integrated services you choose to use`
    },
    {
      id: 'information-sharing',
      icon: Share2,
      title: 'Information Sharing and Disclosure',
      content: `**Healthcare Providers**
We share your information with:

• **Your Doctors:** Relevant medical history and current information for treatment
• **Specialists:** Information necessary for referrals and consultations
• **Hospitals and Clinics:** Data required for appointments and procedures
• **Pharmacies:** Prescription information for medication fulfillment
• **Laboratories:** Test orders and results

**Service Providers**
We engage trusted third parties to perform services on our behalf:

• **Cloud Hosting:** Secure data storage and processing
• **Payment Processors:** Secure handling of financial transactions
• **Email and SMS Services:** Delivery of notifications and reminders
• **Analytics Providers:** Usage analysis and service improvement
• **Customer Support:** Technical assistance and user support

All service providers are contractually bound to protect your information and use it only for specified purposes.

**Legal Requirements**
We may disclose information when required by law:

• **Court Orders:** In response to valid legal process
• **Government Requests:** To comply with regulatory requirements
• **Public Safety:** To prevent harm or protect public health
• **Law Enforcement:** In response to lawful requests from authorities

**Business Transfers**
In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of the transaction. We will notify you of any such change in ownership or control of your personal information.

**With Your Consent**
We may share information with third parties when you explicitly authorize us to do so.`
    },
    {
      id: 'data-security',
      icon: Lock,
      title: 'Data Security',
      content: `**Security Measures**
We implement comprehensive security measures to protect your information:

• **Encryption:**
  - All data transmitted using TLS 1.3 encryption
  - Sensitive data encrypted at rest using AES-256
  - End-to-end encryption for video consultations
  - Encrypted database connections

• **Access Controls:**
  - Role-based access control (RBAC)
  - Multi-factor authentication for staff
  - Regular access reviews and audits
  - Principle of least privilege enforcement

• **Technical Safeguards:**
  - Firewalls and intrusion detection systems
  - Regular security vulnerability assessments
  - Automated threat monitoring
  - Secure development practices

• **Physical Security:**
  - Secure data centers with restricted access
  - 24/7 surveillance and monitoring
  - Environmental controls and backup power
  - Regular security audits

**Data Breach Response**
In the unlikely event of a data breach:

• We will notify affected users within 72 hours of discovery
• We will report to relevant authorities as required by law
• We will provide guidance on protective measures
• We will conduct thorough investigation and remediation

**Your Security Responsibilities**
To help protect your information:

• Use strong, unique passwords
• Enable two-factor authentication
• Keep your login credentials confidential
• Log out when finished using shared devices
• Report suspicious activity immediately`
    },
    {
      id: 'data-retention',
      icon: Clock,
      title: 'Data Retention and Deletion',
      content: `**Retention Periods**
We retain your information for the following periods:

• **Active Accounts:** As long as your account is active
• **Medical Records:** Minimum 10 years after last service (per medical record retention laws)
• **Financial Records:** 7 years (for tax and accounting purposes)
• **Communication Records:** 3 years
• **Technical Logs:** 1 year
• **Deleted Accounts:** Medical records retained as required by law; other data deleted within 30 days

**Deletion Rights**
You have the right to request deletion of your personal information:

• **Account Deletion:** You can delete your account through settings
• **Specific Data:** Request deletion of specific information not required by law
• **Medical Records:** Subject to legal retention requirements
• **Backup Systems:** Data may remain in backups for up to 90 days after deletion

**Exceptions to Deletion**
We may retain information when required by:

• Legal obligations and regulatory requirements
• Ongoing legal proceedings
• Public health and safety needs
• Medical record retention laws
• Fraud prevention and security purposes`
    },
    {
      id: 'your-rights',
      icon: UserCheck,
      title: 'Your Privacy Rights',
      content: `**Right to Access**
You have the right to:

• Request a copy of your personal information
• View your medical records through the Platform
• Receive information about how we process your data
• Obtain details about data sharing

**Right to Rectification**
You can:

• Update your personal information in account settings
• Request corrections to inaccurate medical records
• Add supplementary information to your records
• Report errors in your data

**Right to Erasure**
Subject to legal requirements, you can:

• Request deletion of your personal information
• Close your account and delete associated data
• Withdraw consent for specific processing activities

**Right to Restrict Processing**
You may request limitation of processing when:

• You contest the accuracy of your data
• Processing is unlawful but you oppose deletion
• We no longer need the data but you require it for legal claims
• You have objected to processing pending verification

**Right to Data Portability**
You can:

• Request your data in a structured, machine-readable format
• Transfer your data to another service provider
• Receive direct transmission to another controller where technically feasible

**Right to Object**
You have the right to:

• Object to processing based on legitimate interests
• Opt-out of marketing communications
• Object to automated decision-making
• Withdraw consent at any time

**Right to Complain**
If you believe we have violated your privacy rights:

• Contact our Data Protection Officer
• File a complaint with relevant data protection authority
• Seek judicial remedy if necessary`
    },
    {
      id: 'cookies',
      icon: Cookie,
      title: 'Cookies and Tracking Technologies',
      content: `**Types of Cookies We Use**

**Essential Cookies**
Required for basic Platform functionality:
• Session management and authentication
• Security features and fraud prevention
• Load balancing and server routing
• Accessibility preferences

**Functional Cookies**
Enhance your experience:
• Language and region preferences
• Login information (if you choose "Remember Me")
• Display preferences (font size, theme)
• Form auto-fill information

**Analytics Cookies**
Help us understand usage:
• Page visit statistics
• Feature usage patterns
• Error tracking and debugging
• Performance monitoring

**Marketing Cookies**
Used with your consent for:
• Personalized content recommendations
• Advertising effectiveness measurement
• Social media integration
• Promotional campaign tracking

**Managing Cookies**
You can control cookies through:
• Browser settings to block or delete cookies
• Our cookie consent manager (accessible via footer)
• Individual cookie preferences by category
• Third-party opt-out tools

**Do Not Track**
We respect Do Not Track signals from browsers and will not track users who have enabled this setting, except for essential cookies required for Platform operation.`
    },
    {
      id: 'international',
      icon: Globe,
      title: 'International Data Transfers',
      content: `**Data Location**
Our primary servers are located in Pakistan. However, we may use cloud services and service providers with data centers in other countries.

**Transfer Mechanisms**
When transferring data internationally, we ensure protection through:

• **Standard Contractual Clauses:** EU-approved data transfer agreements
• **Adequacy Decisions:** Transferring only to countries with adequate protection levels
• **Binding Corporate Rules:** Internal policies for intra-group transfers
• **User Consent:** Explicit consent for specific international transfers

**GDPR Compliance (for EU Users)**
If you are in the European Economic Area:

• We process your data based on legal grounds specified in GDPR
• We appoint a representative in the EU for GDPR matters
• We conduct Data Protection Impact Assessments for high-risk processing
• We maintain records of processing activities

**Cross-Border Healthcare**
For international patients:

• Medical records may be shared with healthcare providers in your home country
• We comply with both local and international healthcare privacy laws
• You will be informed of any international data transfers`
    },
    {
      id: 'children',
      icon: UserCheck,
      title: "Children's Privacy",
      content: `**Age Restrictions**
Our Platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.

**Parental Consent**
For users aged 13-18:

• Parental or guardian consent is required for account creation
• Parents/guardians have access to their child's medical records
• Parents can request deletion of their child's information
• Special privacy protections apply to adolescent health information

**Pediatric Services**
When providing healthcare services to minors:

• We comply with pediatric privacy laws
• We balance minor's privacy rights with parental access needs
• Confidentiality is maintained for sensitive adolescent health services as permitted by law
• We provide age-appropriate privacy notices

**Discovery of Underage Users**
If we discover that we have collected information from a child under 13 without parental consent:

• We will delete the information immediately
• We will terminate the associated account
• Parents can contact us to request deletion`
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Communications and Notifications',
      content: `**Types of Communications**
We may contact you via:

**Service Communications (Required)**
• Appointment confirmations and reminders
• Test results availability
• Prescription refill notifications
• Security alerts and account updates
• Critical health information

**Healthcare Communications**
• Preventive care reminders
• Health tips and educational content
• Follow-up care instructions
• Wellness program information

**Marketing Communications (Optional)**
• New service announcements
• Health-related promotions
• Partner offers (only with explicit consent)

**Communication Preferences**
You can manage your preferences:
• Choose email, SMS, or push notifications
• Set quiet hours for non-urgent messages
• Opt-out of marketing communications
• Update contact information

**Notification Security**
• We never send passwords or full medical details via SMS
• Sensitive information requires login to view
• We verify your identity before discussing health information via phone`
    },
    {
      id: 'updates',
      icon: FileText,
      title: 'Updates to This Policy',
      content: `**Policy Changes**
We may update this Privacy Policy periodically to reflect:

• Changes in our practices or services
• New legal or regulatory requirements
• Technological advancements
• User feedback and suggestions

**Notification of Changes**
When we make material changes:

• We will post the updated policy on this page
• We will update the "Last Updated" date
• We will notify you via email for significant changes
• We will require renewed consent for material changes affecting your rights

**Review Encouraged**
We encourage you to review this Privacy Policy regularly to stay informed about how we protect your information.

**Previous Versions**
Previous versions of this policy are available upon request for comparison purposes.`
    },
    {
      id: 'contact',
      icon: Mail,
      title: 'Contact Us',
      content: `**Data Protection Officer**
For privacy-related inquiries, contact our Data Protection Officer:

📧 Email: dpo@drmaharkashifrasheed.com
📞 Phone: +92-XXX-XXXXXXX (ext. 100)
📍 Address: [Hospital Address], Lahore, Pakistan

**General Privacy Inquiries**
For general questions about privacy:

📧 Email: privacy@drmaharkashifrasheed.com
📞 Phone: +92-XXX-XXXXXXX

**Response Time**
We aim to respond to privacy inquiries within:
• 48 hours for urgent matters
• 5 business days for standard requests
• 30 days for complex data subject requests

**Regulatory Authority**
If you are not satisfied with our response, you may contact:

Pakistan Telecommunication Authority (PTA)
Or your local data protection authority if outside Pakistan`
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6">
              <Shield className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
              Your privacy and data security are our top priorities
            </p>
            <p className="text-sm text-cyan-200 mt-4">
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
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-cyan-100 text-gray-700 hover:text-cyan-700 rounded-full text-sm whitespace-nowrap transition-colors"
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
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {section.title}
                  </h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
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
          className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-8 text-white text-center"
        >
          <Lock className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-4">Your Privacy Matters</h2>
          <p className="text-cyan-100 mb-6 max-w-2xl mx-auto">
            We are committed to protecting your personal and health information. By using our Platform, you trust us with your data, and we take that responsibility seriously.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/terms"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            >
              <FileText className="w-5 h-5" />
              View Terms of Service
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-cyan-600 hover:bg-cyan-50 rounded-xl transition-colors"
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
          This Privacy Policy is subject to change. Please review periodically for updates.
        </p>
      </section>
    </div>
  )
}
