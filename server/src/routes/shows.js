import express from 'express';
import { prisma } from '../db/prisma.js';

const router = express.Router();

const GIRIJA_HALL_METADATA = {
  name: "Girija Cinema Hall",
  nepaliName: "गिरिजा सिनेमा हल",
  address: "Station Road, Janakpurdham - 45600, Dhanusha, Nepal",
  phone: "+977 41-520123 / +977 9801234567",
  screens: [
    {
      id: "audi-1",
      name: "Audi 1: Main Hall (Dolby Atmos 7.1)",
      soundSystem: "Dolby Surround 7.1",
      projection: "Barco 2K Digital Cinema",
      capacity: 380,
      tiers: [
        { name: "Balcony (बाल्कोनी)", rows: ["A", "B", "C"], price: 300 },
        { name: "Deluxe (डिलक्स)", rows: ["D", "E", "F", "G"], price: 220 },
        { name: "Standard (साधारण)", rows: ["H", "I", "J"], price: 150 }
      ]
    },
    {
      id: "audi-2",
      name: "Audi 2: Gold Class (Qube Digital)",
      soundSystem: "Qube Master Sound",
      projection: "Christie Digital Laser",
      capacity: 220,
      tiers: [
        { name: "Balcony (बाल्कोनी)", rows: ["A", "B"], price: 300 },
        { name: "Deluxe (डिलक्स)", rows: ["C", "D", "E"], price: 220 },
        { name: "Standard (साधारण)", rows: ["F", "G", "H"], price: 150 }
      ]
    }
  ],
  showtimes: ["11:30 AM", "02:30 PM", "05:45 PM", "08:45 PM"]
};

// GET /api/shows/hall-info
router.get('/hall-info', (req, res) => {
  res.json({ success: true, data: GIRIJA_HALL_METADATA });
});

// GET /api/shows/:showId/seats
router.get('/:showId/seats', async (req, res) => {
  const { showId } = req.params;

  try {
    let bookedSeats = [];
    let heldSeats = [];

    if (prisma?.booking) {
      const confirmedBookings = await prisma.booking.findMany({
        where: { showId, paymentStatus: 'CONFIRMED' },
        select: { seats: true }
      });
      bookedSeats = confirmedBookings.flatMap(b => b.seats);

      const activeHolds = await prisma.seatHold.findMany({
        where: {
          showId,
          expiresAt: { gt: new Date() }
        },
        select: { seatId: true, expiresAt: true, holderId: true }
      });
      heldSeats = activeHolds;
    }

    res.json({
      success: true,
      showId,
      bookedSeats,
      heldSeats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: true,
      showId,
      bookedSeats: [],
      heldSeats: [],
      error: error.message
    });
  }
});

export default router;
