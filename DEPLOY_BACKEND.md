# 🚀 Backend Deployment Guide — Girija Cinema Hall

This guide walks you through deploying the Node.js + Express + Prisma backend (`server/`) to the cloud for free, so your live website at [GitHub Pages](https://purbeynitu.github.io/online-booking-website-for-theater/) can communicate with your Supabase database over the public internet.

---

## 🌟 Method 1: Deploy to Render (Recommended — 100% Free & Fast)

Render has native Node.js support, runs in Singapore (`ap-southeast-1` — directly next to your Supabase AWS region for ultra-low latency), and auto-detects `render.yaml`.

### Step 1: Sign in to Render
1. Go to [https://dashboard.render.com](https://dashboard.render.com).
2. Sign in with your GitHub account (**purbeynitu**).

### Step 2: Create Web Service from GitHub
1. Click the blue **"New +"** button in the top right.
2. Select **"Web Service"** (or **"Blueprint"**).
3. Connect your repository: `purbeynitu/online-booking-website-for-theater`.
4. Fill in the following settings:
   - **Name**: `girija-cinema-api`
   - **Region**: `Singapore (Southeast Asia)`
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Step 3: Add Environment Variables
Under the **Environment Variables** section on Render, add these:

| Key | Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DATABASE_URL` | `postgresql://postgres.pbvmeggyraffkkmlnfpk:qii8KDp0qbts6Lqv@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres.pbvmeggyraffkkmlnfpk:qii8KDp0qbts6Lqv@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | `girija_cinema_janakpur_jwt_super_secret_key_2024` |
| `CORS_ORIGIN` | `https://purbeynitu.github.io,http://localhost:5173` |
| `NEPALPAY_MERCHANT_ID` | `NP-GIRIJA-JANAKPUR-01` |
| `NEPALPAY_MERCHANT_NAME` | `Girija Cinema Hall Janakpur` |
| `NEPALPAY_PAN` | `302918271` |
| `ESEWA_PRODUCT_CODE` | `EPAYTEST` |
| `ESEWA_SECRET_KEY` | `8gBm/:&EnhH.1/q` |

### Step 4: Click "Create Web Service"
- Render will build your server, run `npx prisma generate`, and start Express on port 10000.
- When done, Render will give you a public URL like:  
  👉 `https://girija-cinema-api.onrender.com`
- Test health by opening: `https://girija-cinema-api.onrender.com/health`

---

## 🚂 Method 2: Deploy to Railway (Alternative)

1. Go to [https://railway.app](https://railway.app) and sign in with GitHub.
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select `online-booking-website-for-theater`.
4. In **Settings**, set **Root Directory** to `server`.
5. In **Variables**, paste the environment variables from the table above.
6. In **Networking**, click **"Generate Domain"** to get your public HTTPS URL.

---

## 🔗 Connecting Your Deployed Backend to the Live Website

Once your backend is live (e.g. `https://girija-cinema-api.onrender.com`):

### Option A: Set via Browser Admin Dashboard (Instant — No rebuild needed)
1. Open your live website: [https://purbeynitu.github.io/online-booking-website-for-theater/](https://purbeynitu.github.io/online-booking-website-for-theater/)
2. Open Browser Console (`F12`) and run:
   ```javascript
   localStorage.setItem('girija_custom_api_url', 'https://girija-cinema-api.onrender.com');
   location.reload();
   ```
3. Your live frontend will immediately connect to your Render backend and Supabase database!

### Option B: Permanent Build Configuration
Create `client/.env.production`:
```env
VITE_API_URL=https://girija-cinema-api.onrender.com
```
Then run:
```bash
npm run deploy
```
This bakes your backend URL permanently into the GitHub Pages deployment.
