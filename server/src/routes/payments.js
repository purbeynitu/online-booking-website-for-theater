import express from 'express';
import { nepalPayService } from '../services/nepalPayService.js';

const router = express.Router();

/**
 * POST /api/payments/create-order
 * Authoritatively calculates price, holds seats, creates PENDING booking,
 * and generates signed eSewa / NepalPay parameters.
 */
router.post('/create-order', async (req, res) => {
  try {
    const {
      showId,
      seatIds,
      snacks,
      couponCode,
      customer,
      gateway,
      origin
    } = req.body;

    const requestOrigin = origin || req.headers.origin || 'http://localhost:5173';

    const orderData = await nepalPayService.createPaymentOrder({
      showId,
      seatIds,
      snacks,
      couponCode,
      customer,
      gateway: gateway || 'nepalpay_qr',
      origin: requestOrigin
    });

    res.status(201).json({ success: true, data: orderData });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/payments/verify-esewa
 * Decodes eSewa returned base64 data, validates HMAC signature,
 * checks amount, and marks booking as CONFIRMED.
 */
router.post('/verify-esewa', async (req, res) => {
  try {
    const { encodedData } = req.body;
    if (!encodedData) {
      return res.status(400).json({ success: false, message: 'encodedData is required' });
    }

    const result = await nepalPayService.verifyEsewaPayment({ encodedData });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('eSewa verification error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/payments/verify-qr
 * Confirms payment for a NepalPay / Fonepay dynamic QR
 */
router.post('/verify-qr', async (req, res) => {
  try {
    const { bookingRef, transactionRef } = req.body;
    if (!bookingRef) {
      return res.status(400).json({ success: false, message: 'bookingRef is required' });
    }

    const result = await nepalPayService.confirmQrPayment({ bookingRef, transactionRef });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('QR verification error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/payments/status/:bookingRef
 * Check live status of a booking (used by QR polling)
 */
router.get('/status/:bookingRef', async (req, res) => {
  try {
    const { bookingRef } = req.params;
    const booking = await nepalPayService.getBookingPaymentStatus(bookingRef);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---------------------------------------------------------
// Legacy / Helper endpoints
// ---------------------------------------------------------

// POST /api/payments/nepalpay/qr
router.post('/nepalpay/qr', (req, res) => {
  const { amount, bookingRef, customerName } = req.body;
  if (!amount || !bookingRef) {
    return res.status(400).json({ success: false, message: 'Amount and bookingRef are required' });
  }
  const qrData = nepalPayService.generateNepalPayQr({
    amount: parseFloat(amount),
    bookingRef,
    customerName: customerName || 'Girija Cinema Guest'
  });
  res.json({ success: true, data: qrData });
});

// POST /api/payments/esewa/sign
router.post('/esewa/sign', (req, res) => {
  const { totalAmount, transactionUuid } = req.body;
  if (!totalAmount || !transactionUuid) {
    return res.status(400).json({ success: false, message: 'totalAmount and transactionUuid required' });
  }
  const signData = nepalPayService.generateEsewaSignature({
    totalAmount,
    transactionUuid
  });
  res.json({ success: true, data: signData });
});

export default router;
