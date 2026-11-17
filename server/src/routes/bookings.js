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

// POST /api/bookings (Confirm and create ticket)
router.post('/', async (req, res) => {
  const bookingData = req.body;

  const bookingRef = `GJ-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    let savedBooking;

    if (prisma?.booking) {
      savedBooking = await prisma.booking.create({
        data: {
          bookingRef,
          showId: bookingData.showId || 'default-show',
          customerName: bookingData.customerName,
          customerPhone: bookingData.customerPhone,
          customerEmail: bookingData.customerEmail,
          seats: bookingData.seats,
          snacks: bookingData.snacks,
          seatSubtotal: bookingData.seatSubtotal,
          snacksTotal: bookingData.snacksTotal || 0,
          serviceCharge: bookingData.serviceCharge || 20,
          discountAmount: bookingData.discountAmount || 0,
          totalAmount: bookingData.totalAmount,
          paymentGateway: bookingData.paymentGateway || 'NEPALPAY_QR',
          paymentStatus: 'CONFIRMED',
          nepalPayTxId: bookingData.nepalPayTxId || `NPAY-${Date.now()}`,
          paymentRef: bookingData.paymentRef || `NCHL-${Date.now().toString().slice(-6)}`
        }
      });
    } else {
      savedBooking = {
        id: `book-${Date.now()}`,
        bookingRef,
        ...bookingData,
        paymentStatus: 'CONFIRMED',
        createdAt: new Date().toISOString()
      };
    }

    res.status(201).json({ success: true, data: savedBooking });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/bookings/:bookingRef
router.get('/:bookingRef', async (req, res) => {
  const { bookingRef } = req.params;

  try {
    if (prisma?.booking) {
      const booking = await prisma.booking.findUnique({
        where: { bookingRef }
      });
      if (booking) return res.json({ success: true, data: booking });
    }

    res.status(404).json({ success: false, message: 'Ticket not found' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
