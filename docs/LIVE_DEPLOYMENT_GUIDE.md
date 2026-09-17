# GlobalCo JobBoard — Live Production Deployment Guide
## Vercel (Frontend) + Render (Backend) + Neon (Database)

This guide provides the exact, step-by-step instructions to deploy the complete **GlobalCo JobBoard** full-stack platform live to production with **zero cold starts** and **high-speed performance**.

---

## Architecture Overview

| Layer | Platform | Role | Performance Optimization |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** | React 18 + Vite SPA | Edge CDN, Gzip/Brotli, Chunk splitting, 1-year immutable caching |
| **Backend** | **Render** | Java 21 + Spring Boot 3 (Docker) | Serial GC (low memory), GZIP compression, preemptive warmup |
| **Database** | **Neon** | Serverless PostgreSQL | PgBouncer connection pooling, Hikari keep-alive every 30s |
| **Zero Delay** | **GitHub Actions** | 10-Min Cron Ping | Keeps Render & Neon active 24/7 (eliminates 50s cold start) |

---

## Step 1: Create Neon PostgreSQL Database

1. Sign up or log in at **[https://neon.tech](https://neon.tech)**.
2. Click **Create Project**:
   - **Project Name**: `globalco-jobboard`
   - **Postgres Version**: `16` (or latest)
   - **Region**: Choose the region closest to your users or Render region (e.g., `Singapore` / `US East` / `Frankfurt`).
3. On the Neon Dashboard, locate the **Connection Details** card:
   - Make sure to check the box for **"Pooled connection"** (the host will include `-pooler`).
   - Switch the format dropdown to **ParametersOnly** or inspect the connection string.
4. Note your credentials:
   - **Host**: e.g., `ep-cool-snow-123456-pooler.ap-southeast-1.aws.neon.tech`
   - **Database**: `neondb`
   - **Username**: `neondb_owner`
   - **Password**: `<your-neon-password>`
5. Construct your JDBC URL in this exact format:
   ```text
   jdbc:postgresql://<neon-pooler-host>/neondb?sslmode=require&prepareThreshold=0
   ```
   > **Note**: `prepareThreshold=0` is required for Neon PgBouncer transaction pooling.

---

## Step 2: Deploy Backend to Render

### Option A: Using Render Blueprint (`render.yaml`) — Recommended
1. Log in to **[https://render.com](https://render.com)**.
2. Click **New +** -> **Blueprint**.
3. Connect your repository: `abhilashkuruva/GlobalCo-JobPortal`.
4. Render will detect `render.yaml`.
5. Fill in the required environment variables:
   - `DB_URL`: `jdbc:postgresql://<neon-pooler-host>/neondb?sslmode=require&prepareThreshold=0`
   - `DB_USERNAME`: `neondb_owner`
   - `DB_PASSWORD`: `<your-neon-password>`
6. Click **Apply**.

---

### Option B: Manual Web Service Deployment
1. Go to **Render Dashboard** -> Click **New +** -> **Web Service**.
2. Select **Build and deploy from a Git repository** -> Connect `abhilashkuruva/GlobalCo-JobPortal`.
3. Configure the service:
   - **Name**: `globalco-jobboard-backend`
   - **Region**: Same or close to your Neon region (e.g., `Singapore`)
   - **Language**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Instance Type**: `Free` (or `Starter`)
   - **Health Check Path**: `/health`
4. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `PORT` | `8080` |
   | `DB_URL` | `jdbc:postgresql://<neon-pooler-host>/neondb?sslmode=require&prepareThreshold=0` |
   | `DB_USERNAME` | `neondb_owner` (or your Neon user) |
   | `DB_PASSWORD` | `<your-neon-password>` |
   | `JWT_SECRET` | `v9y$B&E)H@McQfTjWnZr4u7x!A%C*F-JaNdRgUkXp2s5v8y/B?E(G+KbPeShVmYq` |
   | `CORS_ALLOWED_ORIGINS` | `https://*.vercel.app,http://localhost:5173,http://localhost:3000` |
   | `HIKARI_MAX_POOL_SIZE` | `5` |
   | `HIKARI_MIN_IDLE` | `2` |
   | `JAVA_OPTS` | `-XX:+UseContainerSupport -XX:MaxRAMPercentage=75 -XX:InitialRAMPercentage=40 -XX:+UseSerialGC -Djava.security.egd=file:/dev/./urandom` |
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (e.g., `https://globalco-jobboard-backend.onrender.com`).
   - Verify health: Visit `https://globalco-jobboard-backend.onrender.com/health` (should return `{"status":"UP"}`).

---

## Step 3: Deploy Frontend to Vercel

1. Log in to **[https://vercel.com](https://vercel.com)**.
2. Click **Add New...** -> **Project**.
3. Select your repository: `abhilashkuruva/GlobalCo-JobPortal`.
4. In the configuration screen:
   - **Root Directory**: Click **Edit** and select `frontend` (CRITICAL!)
   - **Framework Preset**: `Vite` (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://<your-render-backend-name>.onrender.com/api` |
6. Click **Deploy**.
7. Vercel will build and assign you a live URL (e.g., `https://globalco-jobportal.vercel.app`).
8. *(Optional)* Update `CORS_ALLOWED_ORIGINS` in your Render backend settings to include your exact Vercel URL for strict CORS security.

---

## Step 4: Eliminate All Delays & Cold Starts (24/7 Keep-Alive)

On Render's Free tier, services sleep after 15 minutes of inactivity. Starting Spring Boot from sleep takes ~50 seconds.
We have set up multiple zero-delay safeguards:

### 1. Automated GitHub Actions Keep-Alive (Built-in)
The repository includes `.github/workflows/keepalive.yml` which automatically pings your Render backend every 10 minutes:
1. Go to your GitHub repo -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Click **New repository secret** (or Repository Variable):
   - **Name**: `RENDER_BACKEND_URL`
   - **Value**: `https://<your-render-backend-name>.onrender.com`
3. The workflow will run every 10 minutes. Render never sleeps!

### 2. Preemptive Frontend Warmup
The frontend automatically sends a non-blocking background ping to `/health` on app mount, ensuring the backend is awake before the user clicks any action.

### 3. Alternative 3rd-Party Keep-Alive
You can also add `https://<your-render-backend-name>.onrender.com/health` to:
- **[cron-job.org](https://cron-job.org)** (Free 10-minute HTTP GET)
- **[UptimeRobot](https://uptimerobot.com)** (Free 5-minute HTTP monitor)

---

## Step 5: Default Demo Credentials

The database automatically seeds with standard demo accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@globalco.com` | `password` |
| **Recruiter** | `recruiter@globalco.com` | `password` |
| **Candidate** | `candidate@globalco.com` | `password` |
| **New Users** | Use the **Register** button on the live site |

---

## Verification & Health Checklist

- [ ] `/health` returns `{"status":"UP"}` in < 50ms.
- [ ] Vercel assets load with `Cache-Control: public, max-age=31536000, immutable`.
- [ ] Candidate can browse jobs, register, log in, apply, and view profile.
- [ ] Recruiter can post jobs and view candidate applications.
- [ ] Admin dashboard displays stats, user moderation, and audit logs.
