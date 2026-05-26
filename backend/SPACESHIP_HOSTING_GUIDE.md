# Spaceship Hosting Setup Guide - Keep All Data On Spaceship

> **Urdu quick guide:** see `SPACESHIP_DEPLOY_URDU.md` in project root.

## Important: How This App Saves Data (Updated)

This project now **requires MongoDB in production** so user/booking data survives server restarts:

- **MongoDB** — all accounts, bookings, messages, notifications
- **`DATA_DIR/uploads`** — profile images (set absolute path on Spaceship, outside deploy folder)
- **No in-memory database** in production (OTP/users are not lost on crash if MongoDB is running)

Copy `backend/.env.production.example` to `.env` on the server and set `MONGODB_URI`, `DATA_DIR`, `JWT_SECRET`, `CLIENT_URL`.

Start with PM2: `pm2 start ecosystem.config.js`

---

## Goal: Host Everything on Spaceship (No Third-Party Services)

### What You Need from Spaceship:
1. **Node.js Hosting** (for backend)
2. **Database** (MySQL/PostgreSQL/MongoDB)
3. **Static Hosting** (for frontend)

---

## Option 1: Using Spaceship's MySQL Database (Recommended)

Most hosting providers like Spaceship offer MySQL databases. Here's how to set it up:

### Step 1: Create MySQL Database in Spaceship
1. Log in to your Spaceship account
2. Go to "Databases" or "MySQL"
3. Create a new database:
   - Database Name: `drmahar_db`
   - Username: `drmahar_user`
   - Password: (generate strong password)
4. Note down the connection details:
   - Host: (usually `localhost` or provided by Spaceship)
   - Port: `3306`
   - Database Name
   - Username
   - Password

### Step 2: Update Backend to Use MySQL

Install MySQL dependencies:
```bash
cd backend
npm install mysql2 sequelize
```

### Step 3: Update .env File
```
# Database Configuration (MySQL on Spaceship)
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=drmahar_db
DB_USER=drmahar_user
DB_PASS=your_password_here
```

---

## Option 2: Using MongoDB on Same Server (If Spaceship allows)

### Step 1: Install MongoDB on Spaceship Server
```bash
# SSH into your Spaceship server
ssh username@your-domain.com

# Install MongoDB (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y mongodb

# Start MongoDB
sudo service mongodb start

# Enable MongoDB to start on boot
sudo systemctl enable mongodb
```

### Step 2: Update .env
```
MONGODB_URI=mongodb://localhost:27017/dr_mahar_kashif_rasheed
```

---

## Option 3: Using SQLite (Simplest - No Separate Database Server)

SQLite stores data in a file on the server - no separate database needed!

### Step 1: Install SQLite Dependencies
```bash
cd backend
npm install sqlite3 sequelize
```

### Step 2: Update Database Configuration
Create `backend/config/database-sqlite.js`:

```javascript
const { Sequelize } = require('sequelize');
const path = require('path');

// SQLite database stored in file
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../data/database.sqlite'),
  logging: false
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite Database connected successfully');
    console.log('📁 Database file: data/database.sqlite');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('✅ All models synchronized');
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
};

module.exports = { sequelize, connectDB };
```

### Step 3: Update .env
```
DB_TYPE=sqlite
DB_STORAGE=./data/database.sqlite
```

---

## Deployment Steps for Spaceship

### 1. Prepare Your Code

#### Update `backend/.env` for Production:
```
NODE_ENV=production
PORT=5000

# Database (Choose ONE based on what Spaceship provides)
# Option A: MySQL
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=drmahar_db
DB_USER=drmahar_user
DB_PASS=your_mysql_password

# Option B: SQLite (Simplest)
DB_TYPE=sqlite
DB_STORAGE=./data/database.sqlite

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=drmaharkashifrasheed@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Dr Mahar Kashif Rasheed <drmaharkashifrasheed@gmail.com>

# Frontend URL (Your Spaceship domain)
CLIENT_URL=https://your-domain.com
```

### 2. Create `spaceship.json` (if Spaceship supports it)
```json
{
  "name": "dr-mahar-kashif-rasheed",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### 3. Upload to Spaceship

#### Backend Upload:
1. Zip the `backend` folder
2. Upload to Spaceship via:
   - File Manager, OR
   - FTP/SFTP, OR
   - Git deployment

#### Frontend Upload:
1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Upload the `frontend/dist` or `frontend/.next` folder to Spaceship's public_html

### 4. Install Dependencies on Server
```bash
cd /path/to/backend
npm install --production
```

### 5. Start the Server
```bash
# Using PM2 (recommended for production)
npm install -g pm2
pm2 start server.js --name "dr-mahar-backend"
pm2 save
pm2 startup

# Or using nohup
nohup node server.js > app.log 2>&1 &
```

### 6. Set Up Domain
1. Point your domain to Spaceship nameservers
2. Configure SSL certificate (Let's Encrypt)
3. Set up reverse proxy (Nginx) if needed

---

## Data Backup Strategy (Important!)

Since all data is on Spaceship, set up automatic backups:

### For SQLite:
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /path/to/data/database.sqlite /path/to/backups/database_$DATE.sqlite
# Keep only last 30 backups
ls -t /path/to/backups/database_*.sqlite | tail -n +31 | xargs rm -f
```

### For MySQL:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u drmahar_user -p'your_password' drmahar_db > /path/to/backups/backup_$DATE.sql
```

Add to crontab for daily backups:
```bash
0 2 * * * /path/to/backup-script.sh
```

---

## Complete File Structure on Spaceship

```
/home/username/
├── public_html/           # Frontend files
│   ├── index.html
│   ├── _next/
│   └── ...
├── backend/               # Backend API
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── data/             # SQLite database (if using SQLite)
│       └── database.sqlite
└── backups/              # Database backups
```

---

## Quick Checklist Before Uploading

- [ ] Update `.env` with production values
- [ ] Change JWT_SECRET to a strong random string
- [ ] Update CLIENT_URL to your actual domain
- [ ] Test locally with production build
- [ ] Create database on Spaceship
- [ ] Update database connection details
- [ ] Build frontend (`npm run build`)
- [ ] Remove `node_modules` before zipping (reinstall on server)
- [ ] Set up automatic backups

---

## Need Help?

If Spaceship provides cPanel or Plesk:
1. Look for "MySQL Databases" in cPanel
2. Create database and user
3. Use the provided connection details

Contact Spaceship support and ask:
- "Do you provide MySQL/PostgreSQL databases?"
- "Can I install MongoDB on my server?"
- "What are the database connection details?"
