require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// No env config needed for CORS: allow local dev (any port) and Netlify-hosted sites.
// Staff routes are protected by a signed token, not by origin.
const ALLOWED_ORIGINS = [
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/,
  /^https:\/\/[a-z0-9-]+(--[a-z0-9-]+)?\.netlify\.app$/i,
];

app.use(
  cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    origin: (origin, cb) => {
      // no Origin header = non-browser tool (curl, health checks)
      if (!origin || ALLOWED_ORIGINS.some((re) => re.test(origin))) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
  })
);
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok', service: 'waste-management-api' }));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

app.listen(PORT, () => console.log(`API running on port ${PORT}`));

// Retry instead of exiting: a brief DNS/network blip must not take the API down
async function connectWithRetry() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message, '- retrying in 5s');
    setTimeout(connectWithRetry, 5000);
  }
}
connectWithRetry();
