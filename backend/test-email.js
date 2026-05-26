/**
 * Email Configuration Test Script
 * Run this to verify your email settings are correct
 * 
 * Usage: node test-email.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('========================================');
console.log('📧 Email Configuration Test');
console.log('========================================\n');

// Check environment variables
const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
const missing = requiredVars.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing environment variables:');
  missing.forEach(v => console.error(`   - ${v}`));
  console.log('\n⚠️  Please add these to your .env file\n');
  process.exit(1);
}

console.log('✅ All environment variables present\n');
console.log('Configuration:');
console.log(`  Host: ${process.env.EMAIL_HOST}`);
console.log(`  Port: ${process.env.EMAIL_PORT}`);
console.log(`  User: ${process.env.EMAIL_USER}`);
console.log(`  From: ${process.env.EMAIL_FROM}`);
console.log(`  Secure: ${process.env.EMAIL_SECURE}\n`);

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Test connection
console.log('🔍 Testing SMTP connection...\n');

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error details:');
    console.error(`  Message: ${error.message}`);
    console.error(`  Code: ${error.code}`);
    console.error(`  Command: ${error.command}`);
    console.error(`  Response Code: ${error.responseCode}`);
    console.error(`  Response: ${error.response}`);
    
    console.log('\n💡 Common fixes:');
    console.log('  1. Make sure you are using an App Password (not your regular Gmail password)');
    console.log('  2. Enable 2-Step Verification in your Google Account');
    console.log('  3. Generate App Password at: https://myaccount.google.com/apppasswords');
    console.log('  4. Use the 16-character app password without spaces\n');
    
    process.exit(1);
  } else {
    console.log('✅ SMTP connection successful!\n');
    
    // Send test email
    console.log('📤 Sending test email...\n');
    
    const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email - Dr Mahar Kashif Rasheed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Email Test Successful! 🎉</h2>
          <p>This is a test email to verify your email configuration.</p>
          <div style="background: linear-gradient(135deg, #3b82f6, #06b6d4); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <p style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0;">${testOTP}</p>
            <p style="color: #e0e7ff; margin: 10px 0 0 0;">Sample OTP Code</p>
          </div>
          <p>If you received this email, your configuration is working correctly!</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Dr Mahar Kashif Rasheed Healthcare<br>
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    };
    
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('❌ Failed to send test email:\n');
        console.error(`  Error: ${err.message}\n`);
        process.exit(1);
      } else {
        console.log('✅ Test email sent successfully!\n');
        console.log('Details:');
        console.log(`  Message ID: ${info.messageId}`);
        console.log(`  Accepted: ${info.accepted.join(', ') || 'None'}`);
        console.log(`  Rejected: ${info.rejected.join(', ') || 'None'}`);
        console.log(`\n📨 Check your inbox at: ${process.env.EMAIL_USER}\n`);
        console.log('========================================');
        console.log('✅ All tests passed! Email is working.');
        console.log('========================================\n');
        process.exit(0);
      }
    });
  }
});
