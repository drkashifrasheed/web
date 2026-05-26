# MongoDB Atlas Setup Guide - For Permanent Data Storage

## Why MongoDB Atlas?

Currently, the website is using **local MongoDB** which means:
- ❌ Data is lost when you restart your computer
- ❌ Data is only stored on your local machine
- ❌ Other users can't access the data

**MongoDB Atlas (Cloud)** solves this:
- ✅ Data persists forever (stored in the cloud)
- ✅ Accessible from anywhere
- ✅ Free tier available (512MB storage)
- ✅ Automatic backups

---

## Step-by-Step Setup

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with Google or email

### Step 2: Create a Cluster
1. After signing in, click "Build a Database"
2. Choose **M0 (Free Tier)** - Shared Cluster
3. Select your closest region (e.g., Mumbai for Pakistan)
4. Click "Create Cluster" (takes 1-2 minutes)

### Step 3: Create Database User
1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter:
   - Username: `drmahar_user`
   - Password: `YourStrongPassword123`
5. Click "Add User"

### Step 4: Allow Network Access
1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add your specific IP address
4. Click "Confirm"

### Step 5: Get Connection String
1. Go back to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Click "Connect your application"
4. Copy the connection string (looks like this):
   ```
   mongodb+srv://drmahar_user:YourStrongPassword123@cluster0.xxxxx.mongodb.net/dr_mahar_kashif_rasheed?retryWrites=true&w=majority
   ```

### Step 6: Update .env File
1. Open `backend/.env` file
2. Replace the MONGODB_URI line with your connection string:
   ```
   MONGODB_URI=mongodb+srv://drmahar_user:YourStrongPassword123@cluster0.xxxxx.mongodb.net/dr_mahar_kashif_rasheed?retryWrites=true&w=majority
   ```
3. Save the file

### Step 7: Restart the Server
1. Stop the backend server (Ctrl+C)
2. Start it again: `cd backend && node server.js`
3. You should see: "MongoDB Connected: cluster0.xxxxx.mongodb.net"

---

## Alternative: Install Local MongoDB (Data persists on your computer)

If you prefer to keep data locally but want it to persist:

### Windows:
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run as a Windows service automatically
4. Data will be saved in `C:\Program Files\MongoDB\Server\7.0\data`

### Or Use MongoDB Compass (GUI):
1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Install and run it
3. Click "New Connection"
4. Use: `mongodb://localhost:27017`
5. This will start MongoDB service automatically

---

## Quick Test

After setup, test if data persists:
1. Register a new user
2. Close the website (stop both servers)
3. Restart the servers
4. Try logging in with the same user
5. If it works, data is being saved permanently! 🎉

---

## Need Help?

If you get any errors:
1. Check that your IP is allowed in Network Access
2. Verify the password in the connection string
3. Make sure the cluster is active (green dot in Atlas dashboard)
4. Check the backend console for specific error messages
