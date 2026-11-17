import express from 'express';
import { nepalPayService } from '../services/nepalPayService.js';

const router = express.Router();

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

// POST /api/payments/verify
router.post('/verify', async (req, res) => {
  const { gateway, payload } = req.body;

  const verification = nepalPayService.verifyPaymentCallback({
    gateway: gateway || 'nepalpay_qr',
    payload
  });

  res.json({ success: true, data: verification });
});

export default router;
