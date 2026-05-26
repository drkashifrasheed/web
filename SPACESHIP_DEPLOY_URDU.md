# Spaceship Hosting — Data Hamesha Save Rahega

## Aap ka data kahan save hota hai?

| Cheez | Kahan save | Restart ke baad |
|--------|------------|------------------|
| Users, login, bookings, messages | **MongoDB** | ✅ Safe |
| Profile photos | **DATA_DIR/uploads** folder | ✅ Safe |
| OTP codes (temporary) | MongoDB (10 min) | OTP expire ho jata hai — normal hai |

**Zaroori:** Production par server **bina MongoDB ke start nahi hoga** — taake koi data memory mein na rahe jo restart par delete ho jaye.

---

## Step 1: Spaceship par MongoDB

### Agar VPS / dedicated server hai (SSH access):
```bash
# Ubuntu par MongoDB install
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable mongod
sudo systemctl start mongod
```

`.env` mein:
```
MONGODB_URI=mongodb://127.0.0.1:27017/dr_mahar_kashif_rasheed
```

### Agar sirf shared hosting hai (MongoDB install nahi hota):
**MongoDB Atlas** (free) use karein — data cloud par permanent rehta hai, website Spaceship par chalegi:

1. https://www.mongodb.com/cloud/atlas par account
2. Free cluster banaein
3. Connection string copy karein
4. `.env` mein `MONGODB_URI=mongodb+srv://...` paste karein

Detail: `backend/MONGODB_SETUP.md`

---

## Step 2: Permanent folders (photos ke liye)

Spaceship par **app folder ke bahar** data folder banayein taake redeploy par photos delete na hon:

```bash
mkdir -p /home/APNA_USERNAME/dr-mahar-data/uploads
```

`.env` (production):
```
DATA_DIR=/home/APNA_USERNAME/dr-mahar-data
UPLOADS_DIR=/home/APNA_USERNAME/dr-mahar-data/uploads
NODE_ENV=production
CLIENT_URL=https://apni-website.com
```

Sample file: `backend/.env.production.example`

---

## Step 3: Backend upload aur start

```bash
cd backend
npm install --production
cp .env.production.example .env
# .env edit karein (MONGODB_URI, JWT_SECRET, EMAIL, CLIENT_URL)

npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

PM2 crash/restart par server dubara chalega — **data MongoDB + DATA_DIR mein safe rahega**.

---

## Step 4: Frontend build

```bash
cd frontend
cp .env.production.example .env.local
# NEXT_PUBLIC_API_URL = backend ka URL

npm run build
npm start
# ya static export / hosting panel ke mutabiq
```

---

## Step 5: Rozana backup (recommended)

```bash
chmod +x backend/scripts/backup-data.sh
# Cron: har raat 2 baje
0 2 * * * DATA_DIR=/home/user/dr-mahar-data MONGODB_URI='mongodb://...' /path/to/backend/scripts/backup-data.sh
```

---

## Test: Data save ho raha hai?

1. Naya user register karein
2. Server restart: `pm2 restart dr-mahar-api`
3. Same user se login — agar chal gaya to data permanent hai ✅

Health check: `https://api.apni-site.com/api/health`  
`database: "connected"` hona chahiye.

---

## English technical guide

`backend/SPACESHIP_HOSTING_GUIDE.md`
