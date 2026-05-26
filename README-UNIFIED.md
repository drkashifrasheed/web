# Dr Mahar Kashif Rasheed - Unified Project

This project has been restructured to use a single `node_modules`, single `package.json`, and single `.env` file at the root level.

## Project Structure

```
dr-upload/
├── package.json          # Single package.json for all dependencies
├── .env                  # Single .env file for all configurations
├── node_modules/         # Single node_modules at root
├── backend/
│   ├── server.js         # Express server (also serves frontend in production)
│   ├── routes/           # API routes
│   ├── models/           # Data models
│   └── ...
├── frontend/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/              # Utilities (api.ts, socket.ts)
│   └── ...
└── vercel.json           # Vercel deployment configuration
```

## Installation

```bash
# Install all dependencies (single command)
npm install
```

## Development

```bash
# Run both frontend and backend together
npm run dev

# Or run separately:
npm run dev:backend   # Backend only
npm run dev:frontend  # Frontend only
```

## Production Build

```bash
# Build frontend and start server
npm run build
npm start
```

## Vercel Deployment

The project is configured for Vercel deployment with `vercel.json`. The backend server serves both API and frontend static files.

```bash
# Deploy to Vercel
vercel
```

## Environment Variables

All environment variables are in the single `.env` file at root:

- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - JWT signing secret
- `EMAIL_*` - Email configuration
- `NEXT_PUBLIC_*` - Frontend public variables
- And more...

## How It Works

1. **Single Node Modules**: All dependencies (backend + frontend) are in root `node_modules`
2. **Single Package.json**: Combined dependencies from both frontend and backend
3. **Single .env**: All environment variables in one file
4. **Unified Server**: Backend serves frontend static files in production
5. **Relative API Calls**: Frontend uses `/api` instead of full URLs
6. **Static Export**: Next.js exports to `frontend/dist/` which backend serves

## API & Frontend URLs

- Development:
  - Frontend: http://localhost:3000
  - Backend API: http://localhost:5000/api
  
- Production (unified):
  - Everything served from: http://localhost:5000 (or your domain)
  - API: `/api/*`
  - Frontend: `/*` (served as static files)
