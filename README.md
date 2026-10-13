# Clean Lanka – Waste Management System (Sri Lanka)

MERN app: **Collection Finder** (route/truck, days, time, waste type, fee by area) and **Report Issue** (missed pickup / illegal dumping, with status tracking).

```
/backend   Express + Mongoose REST API
/frontend  React (Vite)
```

API: `GET /api/routes?search=` · `POST /api/reports` · `GET /api/reports?contact=`

## 1. Run locally

Prereqs: Node 18+, a MongoDB Atlas cluster (free M0) with a database user, and Network Access allowing your IP (or `0.0.0.0/0` for the demo).

### Backend
```bash
cd backend
npm install
cp .env.example .env     # Windows PowerShell: copy .env.example .env
# edit .env: set MONGO_URI to your Atlas connection string
npm run seed             # loads sample routes
npm run dev              # http://localhost:5000
```
Check: open http://localhost:5000/api/routes?search=galle

### Frontend (new terminal)
```bash
cd frontend
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:5000
npm run dev              # http://localhost:5173
```

Test: search "Galle" in Collection Finder; submit a report, then view its status with the same phone/email.

Report status (`Pending` / `In Progress` / `Resolved`) is changed directly in Atlas (Collections → reports → edit `status`).

## 2. Deploy

### Backend → Render
1. Push the repo to GitHub.
2. Render → New → **Web Service** → connect `nimmi-codes/hackathon-2`.
3. Root Directory: `backend` · Build: `npm install` · Start: `npm start`.
4. Environment variables:
   - `MONGO_URI` = Atlas connection string
   - `CLIENT_ORIGIN` = your Netlify URL (e.g. `https://your-site.netlify.app`, no trailing slash) – add after step below, then redeploy
   - (`PORT` is provided by Render automatically)
5. In Atlas → Network Access, allow `0.0.0.0/0` (Render has no fixed IP on the free tier).
6. Seed the data once from your machine (with `.env` pointing at Atlas): `npm run seed`.

### Frontend → Netlify
1. Netlify → Add new site → Import from GitHub → this repo.
2. Base directory: `frontend` · Build command: `npm run build` · Publish directory: `frontend/dist`.
3. Environment variable: `VITE_API_URL` = your Render URL (e.g. `https://waste-api.onrender.com`).
4. Deploy, then put the Netlify URL into Render's `CLIENT_ORIGIN` and redeploy the backend.

Note: Render's free tier sleeps when idle; the first request may take ~30–60s.

Seed data is sample data for demonstration, not official council schedules.
