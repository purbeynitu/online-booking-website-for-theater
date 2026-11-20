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

// GET /api/bookings/verify-ticket (Gatekeeper lookup by QR or reference)
router.get('/verify-ticket', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ success: false, message: 'Query parameter required' });
  }

  try {
    let cleanRef = query.trim();

    // If query is a scanned JSON string from ticket QR code
    if (cleanRef.startsWith('{') && cleanRef.endsWith('}')) {
      try {
        const parsed = JSON.parse(cleanRef);
        if (parsed.ref) cleanRef = parsed.ref;
      } catch (e) { }
    }

    // Strip leading # or prefixes if pasted casually
    cleanRef = cleanRef.replace(/^#/, '').trim().toUpperCase();

    // If user entered only digits e.g. "888866", prepend "GJ-"
    if (/^\d{6}$/.test(cleanRef)) {
      cleanRef = `GJ-${cleanRef}`;
    }

    if (prisma?.booking) {
      const booking = await prisma.booking.findFirst({
        where: {
          OR: [
            { bookingRef: { equals: cleanRef, mode: 'insensitive' } },
            { customerPhone: { contains: cleanRef } }
          ]
        },
        include: {
          show: {
            include: { movie: true, screen: true }
          }
        }
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: `कुनै टिकट फेला परेन (${cleanRef}) - No booking found.`
        });
      }

      if (booking.paymentStatus !== 'CONFIRMED') {
        return res.status(400).json({
          success: false,
          booking,
          message: `भुक्तानी अपूर्ण वा पेन्डिङ छ (Status: ${booking.paymentStatus}). प्रवेश अनुमति छैन!`
        });
      }

      const isCheckedIn = Boolean(booking.paymentRef && booking.paymentRef.includes('#CHECKED_IN:'));
      const checkedInAt = isCheckedIn ? booking.paymentRef.split('#CHECKED_IN:')[1] : null;

      return res.json({
        success: true,
        booking,
        isCheckedIn,
        checkedInAt
      });
    }

    res.status(500).json({ success: false, message: 'Database client unavailable' });
  } catch (error) {
    console.error('Error verifying ticket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bookings/check-in (Gatekeeper approval & admission)
router.post('/check-in', async (req, res) => {
  const { bookingRef, staffName } = req.body;
  if (!bookingRef) {
    return res.status(400).json({ success: false, message: 'bookingRef is required' });
  }

  try {
    if (prisma?.booking) {
      const booking = await prisma.booking.findUnique({
        where: { bookingRef: bookingRef.trim().toUpperCase() },
        include: {
          show: {
            include: { movie: true, screen: true }
          }
        }
      });

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      if (booking.paymentStatus !== 'CONFIRMED') {
        return res.status(400).json({
          success: false,
          message: 'भुक्तानी सम्पन्न नभएको टिकट चेक-इन गर्न मिल्दैन!'
        });
      }

      // Check if already checked in
      if (booking.paymentRef && booking.paymentRef.includes('#CHECKED_IN:')) {
        const checkedInAt = booking.paymentRef.split('#CHECKED_IN:')[1];
        return res.status(409).json({
          success: false,
          alreadyCheckedIn: true,
          checkedInAt,
          message: `⚠️ चेतावनी: यो टिकट पहिले नै मिति ${new Date(checkedInAt).toLocaleTimeString()} मा प्रयोग भइसकेको छ!`
        });
      }

      const checkInTimestamp = new Date().toISOString();
      const currentRef = booking.paymentRef || `NCHL-${Date.now()}`;
      const updatedPaymentRef = `${currentRef}#CHECKED_IN:${checkInTimestamp}`;

      const updatedBooking = await prisma.booking.update({
        where: { bookingRef: booking.bookingRef },
        data: {
          paymentRef: updatedPaymentRef
        },
        include: {
          show: {
            include: { movie: true, screen: true }
          }
        }
      });

      return res.json({
        success: true,
        alreadyCheckedIn: false,
        checkedInAt: checkInTimestamp,
        staffName: staffName || 'Girija Gatekeeper',
        booking: updatedBooking,
        message: 'प्रवेश सफलतापूर्वक स्वीकृत भयो (Entry Approved)!'
      });
    }

    res.status(500).json({ success: false, message: 'Database client unavailable' });
  } catch (error) {
    console.error('Error during check-in:', error);
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
