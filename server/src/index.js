import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import movieRoutes from './routes/movies.js';
import showRoutes from './routes/shows.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:4173', 'https://purbeynitu.github.io'];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.github.io') || origin.includes('localhost')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/movies', movieRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check & Root greeting
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Girija Cinema Hall Backend API',
    venue: 'Girija Cinema Hall, Janakpurdham, Dhanusha, Nepal',
    endpoints: {
      health: '/health',
      movies: '/api/movies',
      shows: '/api/shows',
      bookings: '/api/bookings',
      payments: '/api/payments',
      admin: '/api/admin'
    },
    database: 'PostgreSQL (Supabase)',
    paymentGateway: 'NepalPay QR & eSewa ePaisa V2'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Girija Cinema Hall Backend (NepalPay + Supabase)',
    venue: 'Girija Cinema Hall, Janakpurdham, Nepal',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🎬 Girija Cinema Hall Backend running on http://localhost:${PORT}`);
  console.log(`💳 NepalPay Gateway Service active`);
  console.log(`🗄️ Database target: PostgreSQL (Supabase)`);
});

export default app;
