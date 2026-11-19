import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'girija_cinema_jwt_secret_dev';

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Supports default admin or girija accounts & legacy admin
  const isHardcodedValid = (
    (username === 'admin' && password === 'admin123') ||
    (username === 'girija' && password === 'janakpur123') ||
    (username === 'girija_admin' && password === 'girija123') ||
    (username === 'admincinema' && password === '--mnbvcxz--')
  );

  if (isHardcodedValid) {
    const token = jwt.sign(
      { username, role: 'MANAGER', venue: 'Girija Cinema Hall Janakpur' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        username,
        role: 'MANAGER',
        venue: 'Girija Cinema Hall, Janakpurdham'
      }
    });
  }

  res.status(401).json({ success: false, message: 'अमान्य लगइन विवरण (Invalid username or password)' });
});

// GET /api/admin/health
router.get('/health', async (req, res) => {
  try {
    let dbConnected = false;
    let movieCount = 0;
    let bookingCount = 0;

    if (prisma?.movie) {
      movieCount = await prisma.movie.count();
      bookingCount = await prisma.booking.count();
      dbConnected = true;
    }

    res.json({
      success: true,
      database: 'PostgreSQL (Supabase)',
      status: dbConnected ? 'ONLINE' : 'DEGRADED',
      metrics: {
        moviesInCatalog: movieCount,
        totalBookings: bookingCount,
        serverTime: new Date().toISOString()
      }
    });
  } catch (error) {
    res.json({
      success: false,
      status: 'OFFLINE',
      error: error.message
    });
  }
});

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    let totalRevenue = 145000;
    let totalTickets = 650;
    let recentBookings = [];

    if (prisma?.booking) {
      const bookings = await prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 25
      });
      recentBookings = bookings;
      totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      totalTickets = bookings.reduce((sum, b) => sum + (b.seats ? b.seats.length : 1), 0);
    }

    res.json({
      success: true,
      data: {
        venue: 'Girija Cinema Hall, Janakpurdham',
        totalRevenueNPR: totalRevenue,
        totalTicketsSold: totalTickets,
        activeScreens: 2,
        currency: 'NPR (रू)',
        recentBookings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
