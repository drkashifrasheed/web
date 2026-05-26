const nodemailer = require('nodemailer');

// Validate email configuration
const validateEmailConfig = () => {
  const required = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing email configuration:', missing.join(', '));
    return false;
  }
  
  console.log('✅ Email configuration loaded:');
  console.log('   Host:', process.env.EMAIL_HOST);
  console.log('   Port:', process.env.EMAIL_PORT);
  console.log('   User:', process.env.EMAIL_USER);
  console.log('   From:', process.env.EMAIL_FROM);
  return true;
};

// Create transporter with better configuration
const createTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  };
  
  console.log('📧 Creating email transporter...');
  return nodemailer.createTransport(config);
};

// Create transporter instance
let transporter = null;

// Get or create transporter
const getTransporter = () => {
  if (!transporter) {
    if (!validateEmailConfig()) {
      throw new Error('Email configuration missing');
    }
    transporter = createTransporter();
  }
  return transporter;
};

// Verify transporter connection
const verifyConnection = async () => {
  try {
    const transport = getTransporter();
    console.log('🔍 Verifying email connection...');
    await transport.verify();
    console.log('✅ Email server connection verified successfully!');
    return true;
  } catch (error) {
    console.error('❌ Email connection failed:', error.message);
    return false;
  }
};

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Initialize on module load
try {
  if (validateEmailConfig()) {
    transporter = createTransporter();
    console.log('📧 Email transporter initialized');
  }
} catch (error) {
  console.error('❌ Failed to initialize email transporter:', error.message);
}

// Send verification email
const sendVerificationEmail = async (email, otp, name) => {
  try {
    console.log('📧 Sending verification email to:', email);
    console.log('🔑 OTP:', otp);
    
    // Get transporter
    const transport = getTransporter();
    console.log('✅ Got transporter');
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Email Verification - Dr Mahar Kashif Rasheed',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #3b82f6, #06b6d4);
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              color: #333333;
              margin-bottom: 20px;
            }
            .message {
              font-size: 16px;
              color: #666666;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .otp-container {
              background: linear-gradient(135deg, #3b82f6, #06b6d4);
              border-radius: 10px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #ffffff;
              letter-spacing: 8px;
              margin: 0;
            }
            .otp-label {
              font-size: 14px;
              color: #e0e7ff;
              margin-top: 10px;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .warning p {
              margin: 0;
              color: #92400e;
              font-size: 14px;
            }
            .footer {
              background-color: #f9fafb;
              padding: 20px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 0;
              color: #6b7280;
              font-size: 14px;
            }
            .social-links {
              margin-top: 15px;
            }
            .social-links a {
              display: inline-block;
              margin: 0 10px;
              color: #3b82f6;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 Dr Mahar Kashif Rasheed</h1>
            </div>
            <div class="content">
              <p class="greeting">Hello ${name || 'there'},</p>
              <p class="message">
                Thank you for choosing Dr Mahar Kashif Rasheed Healthcare Services. To complete your registration and ensure the security of your account, please verify your email address using the verification code below:
              </p>
              
              <div class="otp-container">
                <p class="otp-code">${otp}</p>
                <p class="otp-label">Your Verification Code</p>
              </div>
              
              <div class="warning">
                <p><strong>⏰ Important:</strong> This verification code will expire in <strong>10 minutes</strong> for security purposes.</p>
              </div>
              
              <p class="message">
                If you did not request this verification code, please ignore this email or contact our support team immediately.
              </p>
              
              <p class="message">
                We're excited to have you on board and look forward to providing you with exceptional healthcare services.
              </p>
            </div>
            <div class="footer">
              <p><strong>Dr Mahar Kashif Rasheed Healthcare</strong></p>
              <p>Lahore, Pakistan</p>
              <p>📞 +92 300 1234567 | 📧 contact@drmahar.com</p>
              <div class="social-links">
                <a href="#">Website</a> | 
                <a href="#">Facebook</a> | 
                <a href="#">Instagram</a>
              </div>
              <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
                © 2026 Dr Mahar Kashif Rasheed. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transport.sendMail(mailOptions);
    console.log('✅ Verification email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Accepted:', info.accepted);
    console.log('   Rejected:', info.rejected);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    console.error('   Command:', error.command);
    console.error('   Response Code:', error.responseCode);
    console.error('   Response:', error.response);
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
};

// Send login verification email
const sendLoginVerificationEmail = async (email, otp, name) => {
  try {
    console.log('📧 Sending login verification email to:', email);
    console.log('🔑 OTP:', otp);
    
    // Get transporter
    const transport = getTransporter();
    console.log('✅ Got transporter');
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Login Verification - Dr Mahar Kashif Rasheed',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Login Verification</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #3b82f6, #06b6d4);
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              color: #333333;
              margin-bottom: 20px;
            }
            .message {
              font-size: 16px;
              color: #666666;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .otp-container {
              background: linear-gradient(135deg, #3b82f6, #06b6d4);
              border-radius: 10px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #ffffff;
              letter-spacing: 8px;
              margin: 0;
            }
            .otp-label {
              font-size: 14px;
              color: #e0e7ff;
              margin-top: 10px;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .warning p {
              margin: 0;
              color: #92400e;
              font-size: 14px;
            }
            .security-notice {
              background-color: #dbeafe;
              border-left: 4px solid #3b82f6;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .security-notice p {
              margin: 0;
              color: #1e40af;
              font-size: 14px;
            }
            .footer {
              background-color: #f9fafb;
              padding: 20px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 0;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Secure Login</h1>
            </div>
            <div class="content">
              <p class="greeting">Hello ${name || 'there'},</p>
              <p class="message">
                We received a login attempt to your Dr Mahar Kashif Rasheed Healthcare account. For your security, please verify your identity using the verification code below:
              </p>
              
              <div class="otp-container">
                <p class="otp-code">${otp}</p>
                <p class="otp-label">Your Login Verification Code</p>
              </div>
              
              <div class="warning">
                <p><strong>⏰ Time Sensitive:</strong> This code expires in <strong>10 minutes</strong>.</p>
              </div>
              
              <div class="security-notice">
                <p><strong>🔒 Security Notice:</strong> If you did not attempt to log in, please ignore this email and consider changing your password immediately.</p>
              </div>
              
              <p class="message">
                Your account security is our top priority. Never share this code with anyone.
              </p>
            </div>
            <div class="footer">
              <p><strong>Dr Mahar Kashif Rasheed Healthcare</strong></p>
              <p>Lahore, Pakistan</p>
              <p>📞 +92 300 1234567 | 📧 contact@drmahar.com</p>
              <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
                © 2026 Dr Mahar Kashif Rasheed. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transport.sendMail(mailOptions);
    console.log('✅ Login verification email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Accepted:', info.accepted);
    console.log('   Rejected:', info.rejected);
    return true;
  } catch (error) {
    console.error('❌ Error sending login verification email:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    console.error('   Command:', error.command);
    console.error('   Response Code:', error.responseCode);
    console.error('   Response:', error.response);
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
};

// Send profile update verification email
const sendProfileUpdateEmail = async (email, otp, name) => {
  try {
    const transport = getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Profile Update Verification - Dr Mahar Kashif Rasheed',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Profile Update Verification</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); padding: 30px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .otp-code { font-size: 36px; font-weight: bold; color: #3b82f6; letter-spacing: 8px; text-align: center; margin: 20px 0; }
            .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Profile Update Verification</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name || 'there'}</strong>,</p>
              <p>We received a request to update your profile information. To verify this change, please use the following verification code:</p>
              <p class="otp-code">${otp}</p>
              <div class="warning">
                <p><strong>⏰ Important:</strong> This code will expire in <strong>10 minutes</strong>.</p>
              </div>
              <p>If you didn't request this update, please ignore this email or contact support immediately.</p>
            </div>
            <div class="footer">
              <p><strong>Dr Mahar Kashif Rasheed Healthcare</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transport.sendMail(mailOptions);
    console.log('Profile update email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending profile update email:', error);
    return false;
  }
};

// Send booking cancellation verification email
const sendBookingCancellationEmail = async (email, otp, name, bookingDetails) => {
  try {
    const transport = getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Booking Cancellation Verification - Dr Mahar Kashif Rasheed',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Cancellation Verification</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); padding: 30px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .booking-details { background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .otp-code { font-size: 36px; font-weight: bold; color: #ef4444; letter-spacing: 8px; text-align: center; margin: 20px 0; }
            .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Cancellation</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name || 'there'}</strong>,</p>
              <p>We received a request to cancel your booking:</p>
              <div class="booking-details">
                <p><strong>Medical Problem:</strong> ${bookingDetails.medicalProblem}</p>
                <p><strong>Appointment Type:</strong> ${bookingDetails.appointmentType}</p>
              </div>
              <p>To confirm this cancellation, please use the following verification code:</p>
              <p class="otp-code">${otp}</p>
              <div class="warning">
                <p><strong>⚠️ Important:</strong> Once cancelled, this action cannot be undone.</p>
              </div>
            </div>
            <div class="footer">
              <p><strong>Dr Mahar Kashif Rasheed Healthcare</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transport.sendMail(mailOptions);
    console.log('Booking cancellation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending booking cancellation email:', error);
    return false;
  }
};

// Send booking accepted email with appointment details
const sendBookingAcceptedEmail = async (email, name, bookingDetails) => {
  try {
    const transport = getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Appointment Confirmed - Dr Mahar Kashif Rasheed',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Confirmed</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .appointment-details { background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .detail-row { margin: 10px 0; }
            .detail-label { font-weight: bold; color: #059669; }
            .detail-value { color: #333; }
            .notes-box { background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Appointment Confirmed</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name || 'there'}</strong>,</p>
              <p>Great news! Your appointment has been confirmed by Dr. Mahar Kashif Rasheed.</p>
              
              <div class="appointment-details">
                <h3 style="margin-top: 0; color: #059669;">Appointment Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${bookingDetails.assignedDate || 'To be confirmed'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Time:</span>
                  <span class="detail-value">${bookingDetails.assignedTime || 'To be confirmed'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Medical Problem:</span>
                  <span class="detail-value">${bookingDetails.medicalProblem}</span>
                </div>
              </div>
              
              ${bookingDetails.adminNotes ? `
              <div class="notes-box">
                <h4 style="margin-top: 0; color: #6b7280;">Doctor's Notes:</h4>
                <p style="margin-bottom: 0;">${bookingDetails.adminNotes}</p>
              </div>
              ` : ''}
              
              <p style="text-align: center;">
                <a href="${process.env.CLIENT_URL}/profile" class="cta-button">View in Dashboard</a>
              </p>
              
              <p style="font-size: 14px; color: #6b7280;">
                Please arrive 10 minutes early. If you need to cancel or reschedule, please do so at least 24 hours in advance.
              </p>
            </div>
            <div class="footer">
              <p><strong>Dr Mahar Kashif Rasheed Healthcare</strong></p>
              <p>📞 +92 300 1234567 | 📧 contact@drmahar.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transport.sendMail(mailOptions);
    console.log('Booking accepted email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending booking accepted email:', error);
    return false;
  }
};

// Send video call request email with direct link
const sendVideoCallRequestEmail = async (email, name, bookingDetails) => {
  try {
    const videoCallUrl = `${process.env.CLIENT_URL}/video-call/${bookingDetails.bookingId}`;
    const transport = getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Video Consultation Request - Dr Mahar Kashif Rasheed',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Video Consultation Request</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .video-box { background: linear-gradient(135deg, #ede9fe, #ddd6fe); padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center; }
            .video-icon { font-size: 48px; margin-bottom: 10px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; margin: 15px 0; }
            .cta-button:hover { background: linear-gradient(135deg, #7c3aed, #6d28d9); }
            .alternative { margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📹 Video Consultation Request</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name || 'there'}</strong>,</p>
              <p>Dr. Mahar Kashif Rasheed has invited you to a video consultation.</p>
              
              <div class="video-box">
                <div class="video-icon">🎥</div>
                <h3 style="margin: 10px 0; color: #5b21b6;">Join Video Call Now</h3>
                <p style="color: #6b7280; margin-bottom: 20px;">Click the button below to join the video consultation instantly</p>
                <a href="${videoCallUrl}" class="cta-button">Join Video Call</a>
              </div>
              
              <div class="alternative">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  <strong>Having trouble?</strong><br>
                  Copy and paste this link in your browser:<br>
                  <code style="background: white; padding: 5px 10px; border-radius: 4px; word-break: break-all;">${videoCallUrl}</code>
                </p>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                You will also receive a notification on the website and through SMS (if enabled).
              </p>
            </div>
            <div class="footer">
              <p><strong>Dr Mahar Kashif Rasheed Healthcare</strong></p>
              <p>📞 +92 300 1234567 | 📧 contact@drmahar.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transport.sendMail(mailOptions);
    console.log('Video call request email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending video call request email:', error);
    return false;
  }
};

const sendGenericEmail = async ({ to, subject, html }) => {
  try {
    const transport = getTransporter();
    const info = await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('sendGenericEmail error:', error.message);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendVerificationEmail,
  sendLoginVerificationEmail,
  sendProfileUpdateEmail,
  sendBookingCancellationEmail,
  sendBookingAcceptedEmail,
  sendVideoCallRequestEmail,
  sendGenericEmail,
  verifyConnection,
  getTransporter,
};
