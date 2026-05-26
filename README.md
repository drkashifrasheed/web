# Dr Mahar Kashif Rasheed - Hospital Booking System

A complete, modern, full-stack hospital booking website with premium UI/UX, real-time features, video calling, and comprehensive admin panel.

## 🏥 Project Overview

**Website Name:** Dr Mahar Kashif Rasheed  
**Type:** Hospital Booking & Telemedicine Platform  
**Stack:** Next.js + React + TypeScript + Node.js + Express + MongoDB

## ✨ Key Features

### 🔐 Authentication & Security
- JWT-based authentication
- **Email OTP Verification** for login and registration
- Protected routes
- Role-based access control (Patient, Doctor, Admin)
- Password encryption with bcrypt
- Rate limiting & security headers

### 📅 Booking System
- Complete booking form with patient details
- Real-time booking status updates
- Admin approval workflow (Accept/Reject)
- Appointment scheduling with date/time
- Meeting link generation for video calls
- Email notifications

### 💬 Real-time Communication
- **Chat System:** Socket.io powered real-time messaging
- **Video Calls:** WebRTC implementation
- Typing indicators
- Read receipts
- Online/offline status
- File sharing support

### 👨‍⚕️ User Features
- User registration & login
- Profile management with image upload
- Medical history tracking
- Booking history & upcoming appointments
- Real-time notifications
- Video consultation joining
- Chat with doctors/admins

### 🔧 Admin Panel (Hidden Route: `/secure-admin-dashboard`)
- Secure admin authentication
- Dashboard analytics & statistics
- Booking management (Accept/Reject/Schedule)
- User management
- Doctor management
- Broadcast notifications
- Real-time chat monitoring

### 🎨 UI/UX Features
- Modern medical-themed design
- Glassmorphism effects
- Smooth Framer Motion animations
- Responsive mobile-first design
- Dark/Light mode support
- Loading skeletons
- Toast notifications

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State Management:** Zustand
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + Passport.js
- **Real-time:** Socket.io
- **Security:** Helmet, CORS, Rate Limiting

## 📁 Project Structure

```
dr-mahar-kashif-rasheed/
├── backend/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   └── passport.js      # Google OAuth config
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication
│   │   ├── errorHandler.js  # Error handling
│   │   └── upload.js        # File upload config
│   ├── models/
│   │   ├── User.js          # User model
│   │   ├── Booking.js       # Booking model
│   │   ├── Message.js       # Message model
│   │   ├── Notification.js  # Notification model
│   │   ├── Meeting.js       # Meeting model
│   │   └── index.js         # Model exports
│   ├── routes/
│   │   ├── auth.js          # Auth routes
│   │   ├── users.js         # User routes
│   │   ├── bookings.js      # Booking routes
│   │   ├── messages.js      # Message routes
│   │   ├── notifications.js # Notification routes
│   │   └── admin.js         # Admin routes
│   ├── sockets/
│   │   └── socketHandler.js # Socket.io events
│   ├── server.js            # Main server file
│   └── .env.example         # Environment variables
│
└── frontend/
    ├── app/
    │   ├── (auth)/           # Auth routes group
    │   │   ├── login/
    │   │   └── register/
    │   ├── (dashboard)/      # Dashboard routes
    │   │   ├── dashboard/
    │   │   ├── bookings/
    │   │   ├── chat/
    │   │   ├── video-call/
    │   │   └── notifications/
    │   ├── (admin)/          # Admin routes
    │   │   └── secure-admin-dashboard/
    │   ├── api/              # API routes
    │   ├── page.tsx          # Home page
    │   ├── layout.tsx        # Root layout
    │   └── globals.css       # Global styles
    ├── components/
    │   ├── ui/               # UI components
    │   ├── Navbar.tsx        # Navigation
    │   └── providers.tsx     # App providers
    ├── lib/
    │   ├── api.ts            # API client
    │   └── utils.ts          # Utilities
    ├── store/
    │   └── authStore.ts      # Auth state
    ├── types/
    │   └── index.ts          # TypeScript types
    └── .env.example          # Environment variables
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd dr-mahar-kashif-rasheed
```

2. **Setup Backend**
```bash
cd backend
npm install
```

3. **Create .env file in backend**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dr_mahar_kashif_rasheed
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLIENT_URL=http://localhost:3000
```

4. **Setup Frontend**
```bash
cd ../frontend
npm install
```

5. **Create .env file in frontend**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Running the Application

1. **Start Backend**
```bash
cd backend
npm run dev
```

2. **Start Frontend**
```bash
cd frontend
npm run dev
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 📱 Pages & Routes

### Public Pages
- `/` - Home Page
- `/about` - About Us
- `/doctors` - Doctors Listing
- `/booking` - Book Appointment
- `/login` - Login
- `/register` - Register

### Protected Pages (Patient)
- `/dashboard` - User Dashboard
- `/bookings` - My Bookings
- `/chat` - Messages
- `/video-call` - Video Consultation
- `/notifications` - Notifications
- `/profile` - Profile Settings

### Admin Pages (Hidden)
- `/secure-admin-dashboard` - Admin Dashboard
- `/secure-admin-dashboard/bookings` - Manage Bookings
- `/secure-admin-dashboard/users` - Manage Users
- `/secure-admin-dashboard/doctors` - Manage Doctors

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/dashboard` - Dashboard data
- `GET /api/users/doctors` - List doctors

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List bookings
- `GET /api/bookings/:id` - Get booking
- `PUT /api/bookings/:id/status` - Update status
- `PUT /api/bookings/:id/prescription` - Add prescription

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/:userId` - Get messages
- `POST /api/messages` - Send message

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/bookings` - All bookings
- `GET /api/admin/users` - All users

## 🎯 Key Features Implementation

### Real-time Features (Socket.io)
```javascript
// Join chat room
socket.emit('join_chat', { receiverId });

// Send message
socket.emit('send_message', { receiverId, content });

// Video call signaling
socket.emit('video_offer', { roomId, offer, targetUserId });
socket.emit('video_answer', { roomId, answer, targetUserId });
socket.emit('ice_candidate', { roomId, candidate, targetUserId });
```

### WebRTC Video Call
- Peer-to-peer connection
- Mute/unmute audio
- Enable/disable video
- Screen sharing
- End call

### Booking Workflow
1. Patient creates booking request
2. Admin receives notification
3. Admin reviews and accepts/rejects
4. If accepted: Date, time, doctor assigned
5. Patient receives confirmation notification
6. Video meeting link generated
7. Patient joins video call at scheduled time

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on auth routes
- Helmet security headers
- CORS configuration
- Input validation
- XSS protection
- Role-based access control

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly buttons
- Mobile bottom navigation
- Responsive tables and forms

## 🎨 Design System

### Colors
- Primary: Blue (#3b82f6)
- Secondary: Cyan (#0ea5e9)
- Background: White/Light gray
- Text: Gray-900, Gray-600

### Typography
- Font: Inter
- Headings: Bold, gradient text
- Body: Regular, readable

### Components
- Glassmorphism cards
- Gradient buttons
- Smooth animations
- Loading skeletons
- Toast notifications

## 🛠️ Development Commands

### Backend
```bash
npm run dev      # Development with nodemon
npm start        # Production
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Production server
```

## 📦 Deployment

### Backend Deployment
1. Set environment variables
2. Connect to MongoDB Atlas
3. Deploy to Heroku/Railway/Render
4. Update CORS origin

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel/Netlify
3. Set environment variables
4. Configure API URL

## 📝 License

MIT License - feel free to use this project for your own hospital booking system.

## 👨‍⚕️ About Dr Mahar Kashif Rasheed

This platform is designed for Dr Mahar Kashif Rasheed's medical practice, providing patients with easy access to healthcare services through modern technology.

## 🤝 Support

For support, email contact@drmahar.com or join our Slack channel.

---

**Built with ❤️ for better healthcare**