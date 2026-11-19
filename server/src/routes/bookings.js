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

// GET /api/bookings
router.get('/', async (req, res) => {
  try {
    const { search, limit } = req.query;
    if (prisma?.booking) {
      let where = {};
      if (search && search.trim()) {
        const term = search.trim();
        where = {
          OR: [
            { bookingRef: { contains: term, mode: 'insensitive' } },
            { customerPhone: { contains: term } },
            { customerEmail: { contains: term, mode: 'insensitive' } },
            { customerName: { contains: term, mode: 'insensitive' } }
          ]
        };
      }
      const bookings = await prisma.booking.findMany({
        where,
        include: {
          show: {
            include: { movie: true, screen: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit ? parseInt(limit) : 50
      });
      return res.json({ success: true, data: bookings });
    }
    return res.json({ success: true, data: [] });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bookings (Confirm and create ticket)
router.post('/', async (req, res) => {
  const bookingData = req.body;
  const bookingRef = bookingData.bookingId || bookingData.bookingRef || `GJ-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    let savedBooking;

    if (prisma?.booking) {
      // Ensure target show exists to satisfy foreign key constraint
      let targetShowId = bookingData.showId;
      let validShow = null;

      if (targetShowId) {
        validShow = await prisma.show.findUnique({ where: { id: targetShowId } });
      }

      if (!validShow) {
        const movieId = bookingData.movieId || 'mov-purna-bahadur';
        const date = bookingData.date || new Date().toISOString().split('T')[0];
        const time = bookingData.showtime || bookingData.time || '02:30 PM';
        const screenId = (bookingData.screen && bookingData.screen.includes('2')) ? 'girija-audi-2' : 'girija-audi-1';

        validShow = await prisma.show.findFirst({
          where: { movieId, screenId, date, startTime: time }
        });

        if (!validShow) {
          validShow = await prisma.show.findFirst();
          if (!validShow) {
            validShow = await prisma.show.create({
              data: {
                movieId: 'mov-purna-bahadur',
                screenId: 'girija-audi-1',
                date,
                startTime: time
              }
            });
          }
        }
        targetShowId = validShow.id;
      }

      savedBooking = await prisma.booking.create({
        data: {
          bookingRef,
          showId: targetShowId,
          customerName: bookingData.customerName || bookingData.customer?.name || 'Girija Patron',
          customerPhone: bookingData.customerPhone || bookingData.customer?.phone || '',
          customerEmail: bookingData.customerEmail || bookingData.customer?.email || '',
          seats: bookingData.seats || [],
          snacks: bookingData.snacks || [],
          seatSubtotal: parseFloat(bookingData.seatSubtotal) || 0,
          snacksTotal: parseFloat(bookingData.snacksTotal) || 0,
          serviceCharge: parseFloat(bookingData.serviceCharge) || 20,
          discountAmount: parseFloat(bookingData.discountAmount || bookingData.discount) || 0,
          totalAmount: parseFloat(bookingData.totalAmount) || 0,
          paymentGateway: (bookingData.paymentGateway || bookingData.gateway || 'NEPALPAY_QR').toUpperCase().replace('-', '_'),
          paymentStatus: 'CONFIRMED',
          nepalPayTxId: bookingData.nepalPayTxId || `NPAY-${Date.now()}`,
          paymentRef: bookingData.paymentRef || `NCHL-${Date.now().toString().slice(-6)}`
        },
        include: {
          show: {
            include: { movie: true, screen: true }
          }
        }
      });

      // Release any seat holds for these seats
      if (bookingData.seats && bookingData.seats.length > 0) {
        await prisma.seatHold.deleteMany({
          where: {
            showId: targetShowId,
            seatId: { in: bookingData.seats }
          }
        }).catch(() => {});
      }
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
      const booking = await prisma.booking.findFirst({
        where: {
          OR: [
            { bookingRef },
            { customerPhone: bookingRef }
          ]
        },
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
