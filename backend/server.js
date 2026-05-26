// Load environment variables FIRST before any other imports
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const passport = require('passport');

const { connectDB, isDatabaseConnected } = require('./config/database');
const { ensureDataDirectories, UPLOADS_DIR } = require('./config/paths');
const errorHandler = require('./middleware/errorHandler');
const { protect } = require('./middleware/auth');
const initializeSocketIO = require('./sockets/socketHandler');

// Import email service AFTER dotenv is loaded
const { verifyConnection } = require('./utils/emailService');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookingRoutes = require('./routes/bookings');
const notificationRoutes = require('./routes/notifications');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Data directories created at startup (persistent on Spaceship)
ensureDataDirectories();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Stricter rate limiting for auth routes (disabled in development)
const authLimiter = process.env.NODE_ENV === 'production'
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: 'Too many authentication attempts, please try again later'
    })
  : (req, res, next) => next(); // Skip rate limiting in development

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Passport middleware
app.use(passport.initialize());
require('./config/passport');

// Profile images from persistent storage
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
  
  // Handle all other routes by serving the frontend
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
    }
  });
}

// Database is always connected with file-based storage
// No need to check connection status

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/bookings', protect, bookingRoutes);
app.use('/api/notifications', protect, notificationRoutes);
app.use('/api/messages', protect, messageRoutes);
app.use('/api/admin', protect, adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbOk = isDatabaseConnected();
  res.status(dbOk ? 200 : 503).json({
    success: dbOk,
    message: dbOk ? 'Server is running' : 'Server running but database offline',
    database: dbOk ? 'connected' : 'disconnected',
    uploadsDir: UPLOADS_DIR,
    timestamp: new Date().toISOString()
  });
});

// Initialize Socket.IO
const io = initializeSocketIO(server);
const { startAppointmentScheduler, setSchedulerIo } = require('./utils/appointmentScheduler');
setSchedulerIo(io);
startAppointmentScheduler();

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const dbConnected = await connectDB();

    if (!dbConnected) {
      console.error('❌ Database initialization failed. Server not started.');
      process.exit(1);
    }

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Stop the other process and try again.`);
      } else {
        console.error('Server error:', err.message);
      }
      process.exit(1);
    });

    server.listen(PORT, async () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Uploads directory: ${UPLOADS_DIR}`);
      console.log(
        `Database: ${isDatabaseConnected() ? 'connected (data persists)' : 'offline'}`
      );

      console.log('\n📧 Checking email configuration...');
      const emailConnected = await verifyConnection();
      if (emailConnected) {
        console.log('✅ Email service is ready\n');
      } else {
        console.log(
          '⚠️  Email not configured. OTP emails will not be sent.\n'
        );
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = { app, server };
