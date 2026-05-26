# Dr Mahar Kashif Rasheed - Deployment Guide

## Project Structure (Consolidated)

```
d:/Dr Mahar Kashif Rasheed/
├── .env                    # Single environment file (root only)
├── .gitignore             # Updated for single node_modules
├── package.json           # Combined dependencies (frontend + backend)
├── package-lock.json      # Single lock file
├── node_modules/          # Single node_modules folder
├── vercel.json            # Vercel deployment config
├── backend/               # Backend code only (no package.json, no .env)
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── sockets/
│   ├── utils/
│   └── data/
└── frontend/              # Frontend code only (no package.json, no .env)
    ├── next.config.js
    ├── app/
    ├── components/
    ├── lib/
    ├── public/
    └── .next/             # Build output
```

## Environment Variables (.env)

All environment variables are in a single `.env` file at root:

### Backend Variables
- `PORT=5000`
- `NODE_ENV=production`
- `CLIENT_URL=https://web-ecru-seven-13.vercel.app`
- `JWT_SECRET=your_secret`
- `JWT_EXPIRE=7d`
- `EMAIL_HOST=smtp.gmail.com`
- `EMAIL_PORT=587`
- `EMAIL_USER=drmaharkashifrasheed@gmail.com`
- `EMAIL_PASS=wsglvvqpuqnedzet`
- `ADMIN_EMAIL=admin@drmaharkashifrasheed.com`
- `ADMIN_PASSWORD=secure_admin_password`

### Frontend Variables
- `NEXT_PUBLIC_API_URL=https://web-ecru-seven-13.vercel.app/api`
- `NEXT_PUBLIC_SOCKET_URL=https://web-ecru-seven-13.vercel.app`
- `NEXT_PUBLIC_BASE_URL=https://web-ecru-seven-13.vercel.app`
- `NEXTAUTH_URL=https://web-ecru-seven-13.vercel.app`
- `NEXTAUTH_SECRET=dev_secret_key_12345`
- `NEXT_PUBLIC_APP_NAME=Dr Mahar Kashif Rasheed`
- `NEXT_PUBLIC_ADMIN_SECRET_URL=admin`

## Available Scripts

```bash
# Install dependencies
npm install

# Development (runs both frontend and backend)
npm run dev

# Development (frontend only)
npm run dev:frontend

# Development (backend only)
npm run dev:backend

# Build frontend
npm run build

# Start production server
npm start

# Build and start production
npm run start:prod
```

## Vercel Deployment

### Method 1: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from root directory:
```bash
vercel --prod
```

### Method 2: Using Git Integration

1. Push code to GitHub/GitLab
2. Connect repository to Vercel dashboard
3. Vercel will auto-detect Next.js and deploy

### Important Notes

- **Domain**: https://web-ecru-seven-13.vercel.app
- **API Routes**: All `/api/*` routes are handled by backend
- **Frontend**: All other routes serve the Next.js frontend
- **Environment**: Set `NODE_ENV=production` in Vercel dashboard

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start development server (runs both frontend and backend)
npm run dev

# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api
```

## API Endpoints

All API endpoints are available at `/api/*`:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `GET /api/users/profile` - Get user profile
- `GET /api/bookings` - Get bookings
- `POST /api/bookings` - Create booking
- `GET /api/notifications` - Get notifications
- `GET /api/messages/:userId` - Get messages
- `GET /api/admin/dashboard` - Admin dashboard stats

## Troubleshooting

### Build Errors
If you get build errors, try:
```bash
# Clear cache and rebuild
rmdir /s /q node_modules
rmdir /s /q frontend\.next
del package-lock.json
npm install
npm run build
```

### Port Already in Use
```bash
# Kill processes on port 3000 or 5000
npx kill-port 3000 5000
```

### Environment Variables Not Loading
Make sure `.env` file is in the root directory, not in backend/ or frontend/.

## File Changes Summary

### Removed Files
- ❌ `backend/package.json`
- ❌ `backend/package-lock.json`
- ❌ `backend/.env`
- ❌ `backend/.env.example`
- ❌ `backend/.env.production.example`
- ❌ `frontend/package.json`
- ❌ `frontend/package-lock.json`
- ❌ `frontend/.env.local`
- ❌ `frontend/.env.example`
- ❌ `frontend/.env.production.example`
- ❌ `backend/node_modules/` (consolidated to root)
- ❌ `frontend/node_modules/` (consolidated to root)

### New/Modified Files
- ✅ `package.json` (consolidated dependencies)
- ✅ `.env` (single environment file)
- ✅ `vercel.json` (deployment config)
- ✅ `.gitignore` (updated paths)
- ✅ `backend/server.js` (updated dotenv path)
- ✅ `frontend/next.config.js` (updated for deployment)
- ✅ `frontend/lib/api.ts` (updated API URL)
- ✅ `frontend/lib/socket.ts` (updated socket URL)

## Support

For issues or questions, check:
1. Environment variables in `.env`
2. Vercel deployment logs
3. Browser console for frontend errors
4. Server logs for backend errors
