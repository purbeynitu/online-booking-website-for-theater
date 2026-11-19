import express from 'express';
import { prisma } from '../db/prisma.js';
import { SeatLockService } from '../services/seatLockService.js';

const router = express.Router();
const seatLock = new SeatLockService(prisma);

// POST /api/bookings/hold-seats
router.post('/hold-seats', async (req, res) => {
  const { showId, seatIds, holderId } = req.body;

  if (!showId || !seatIds || !seatIds.length || !holderId) {
    return res.status(400).json({ success: false, message: 'Missing showId, seatIds or holderId' });
  }

  try {
    const result = await seatLock.holdSeats({ showId, seatIds, holderId });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(409).json({ success: false, message: error.message });
  }
});

// POST /api/bookings/release-seats
router.post('/release-seats', async (req, res) => {
  const { showId, seatIds, holderId } = req.body;

  try {
    const result = await seatLock.releaseHolds({ showId, seatIds, holderId });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/bookings/lookup
router.get('/lookup', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ success: false, message: 'Query parameter required' });
  }

  try {
    if (prisma?.booking) {
      const trimmed = query.trim();
      const bookings = await prisma.booking.findMany({
        where: {
          OR: [
            { bookingRef: { equals: trimmed, mode: 'insensitive' } },
            { customerPhone: { contains: trimmed } },
            { customerEmail: { equals: trimmed, mode: 'insensitive' } }
          ],
          paymentStatus: 'CONFIRMED'
        },
        include: {
          show: {
            include: { movie: true, screen: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json({ success: true, data: bookings });
    }
    return res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/bookings/:bookingRef
router.get('/:bookingRef', async (req, res) => {
  const { bookingRef } = req.params;

  try {
    if (prisma?.booking) {
      const booking = await prisma.booking.findUnique({
        where: { bookingRef },
        include: {
          show: {
            include: { movie: true, screen: true }
          }
        }
      });
      if (booking) return res.json({ success: true, data: booking });
    }

    res.status(404).json({ success: false, message: 'Ticket not found' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
