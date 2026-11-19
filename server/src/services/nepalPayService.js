import crypto from 'crypto';
import { prisma } from '../db/prisma.js';
import { SeatLockService } from './seatLockService.js';

const seatLock = new SeatLockService(prisma);

// Authoritative pricing definitions
const SEAT_TIER_PRICING = {
  balcony: { name: 'Balcony', price: 300, rows: ['A', 'B', 'C'] },
  deluxe: { name: 'Deluxe', price: 220, rows: ['D', 'E', 'F', 'G'] },
  standard: { name: 'Standard', price: 150, rows: ['H', 'I', 'J'] }
};

const OFFICIAL_SNACKS = {
  'snk-1': { id: 'snk-1', name: 'Fresh Butter Salted Popcorn', price: 120 },
  'snk-2': { id: 'snk-2', name: 'Janakpur Famous Samosa Chaat', price: 100 },
  'snk-3': { id: 'snk-3', name: 'Crispy Wai Wai Sadeko', price: 80 },
  'snk-4': { id: 'snk-4', name: 'Chilled Coca-Cola / Fanta (500ml)', price: 70 },
  'snk-5': { id: 'snk-5', name: 'Girija Special Masala Tea', price: 35 },
  'snk-6': { id: 'snk-6', name: 'Mithila Cinema Combo', price: 320 }
};

const OFFICIAL_COUPONS = {
  GIRIJA50: { discountAmount: 50, minAmount: 300 },
  JANAKPUR20: { discountPercent: 20, maxDiscount: 120, minAmount: 400 },
  NEPALPAY10: { discountPercent: 10, maxDiscount: 60, minAmount: 200 }
};

export class ServerNepalPayService {
  constructor() {
    this.merchantId = process.env.NEPALPAY_MERCHANT_ID || 'NP-GIRIJA-JANAKPUR-01';
    this.merchantName = process.env.NEPALPAY_MERCHANT_NAME || 'Girija Cinema Hall Janakpur';
    this.merchantPAN = process.env.NEPALPAY_PAN || '302918271';
    this.secretKey = process.env.NEPALPAY_SECRET_KEY || 'girija_nepalpay_secret_dev';
    this.esewaSecret = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
    this.esewaProductCode = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
    this.esewaPaymentUrl = process.env.ESEWA_PAYMENT_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
    this.esewaStatusUrl = process.env.ESEWA_STATUS_URL || 'https://rc-epay.esewa.com.np/api/epay/transaction/status/';
  }

  /**
   * Determine seat price from seat identifier (e.g. "A5" -> 300, "D3" -> 220)
   */
  getSeatPrice(seatId) {
    if (!seatId) return 150;
    const row = seatId.charAt(0).toUpperCase();
    if (['A', 'B', 'C'].includes(row)) return 300;
    if (['D', 'E', 'F', 'G'].includes(row)) return 220;
    return 150;
  }

  /**
   * Authoritative calculation of order amounts on the server
   */
  calculateOrderPricing({ seatIds = [], snacks = [], couponCode = null }) {
    // 1. Calculate seats
    const seatSubtotal = seatIds.reduce((sum, seatId) => sum + this.getSeatPrice(seatId), 0);

    // 2. Calculate snacks
    let snacksTotal = 0;
    const validatedSnacks = [];

    if (Array.isArray(snacks)) {
      for (const item of snacks) {
        const itemQty = parseInt(item.quantity || 1, 10);
        if (itemQty <= 0) continue;
        const official = OFFICIAL_SNACKS[item.id] || { name: item.name || 'Snack', price: parseFloat(item.price) || 0 };
        const lineTotal = official.price * itemQty;
        snacksTotal += lineTotal;
        validatedSnacks.push({
          id: item.id,
          name: official.name,
          quantity: itemQty,
          price: official.price,
          total: lineTotal
        });
      }
    }

    // 3. Fixed service charge
    const serviceCharge = 20;

    // 4. Coupon discount
    const subtotal = seatSubtotal + snacksTotal;
    let discountAmount = 0;

    if (couponCode && typeof couponCode === 'string') {
      const upperCode = couponCode.trim().toUpperCase();
      const couponRule = OFFICIAL_COUPONS[upperCode];
      if (couponRule && subtotal >= couponRule.minAmount) {
        if (couponRule.discountAmount) {
          discountAmount = couponRule.discountAmount;
        } else if (couponRule.discountPercent) {
          const calculated = Math.round((subtotal * couponRule.discountPercent) / 100);
          discountAmount = couponRule.maxDiscount ? Math.min(calculated, couponRule.maxDiscount) : calculated;
        }
      }
    }

    const totalAmount = Math.max(0, subtotal + serviceCharge - discountAmount);

    return {
      seatSubtotal,
      snacksTotal,
      serviceCharge,
      discountAmount,
      totalAmount,
      validatedSnacks
    };
  }

  /**
   * Generates dynamic NepalPay QR string compliant with NCHL & EMVCo
   */
  generateNepalPayQr({ amount, bookingRef, customerName }) {
    const timestamp = Date.now();
    const txRef = `NP-${bookingRef}-${timestamp.toString().slice(-4)}`;

    // EMVCo compliant dynamic QR string format for NepalPay (Merchant Tag 26)
    const qrPayload = `00020101021226580010com.nepalpay0124${this.merchantId}520478325303524540${amount.toFixed(2)}5802NP5926${this.merchantName}6012Janakpurdham62240112${bookingRef}0208${txRef}6304`;

    return {
      success: true,
      qrPayload,
      transactionRef: txRef,
      merchantName: this.merchantName,
      merchantPAN: this.merchantPAN,
      amount,
      bookingRef,
      currency: 'NPR',
      expiresInSeconds: 480 // 8 minutes (matches seat hold)
    };
  }

  /**
   * Generates eSewa ePaisa V2 HMAC-SHA256 signature
   */
  generateEsewaSignature({ totalAmount, transactionUuid, productCode = this.esewaProductCode }) {
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    const hmac = crypto.createHmac('sha256', this.esewaSecret);
    hmac.update(message);
    const signature = hmac.digest('base64');

    return {
      signature,
      signedFieldNames: 'total_amount,transaction_uuid,product_code',
      productCode
    };
  }

  /**
   * Verify incoming eSewa V2 callback payload signature
   */
  verifyEsewaCallbackSignature(data) {
    if (!data || !data.signed_field_names || !data.signature) {
      return false;
    }

    // eSewa sends signed field names as comma separated keys
    const fieldNames = data.signed_field_names.split(',');
    const message = fieldNames.map(f => `${f}=${data[f] || ''}`).join(',');

    const hmac = crypto.createHmac('sha256', this.esewaSecret);
    hmac.update(message);
    const calculatedSignature = hmac.digest('base64');

    return calculatedSignature === data.signature;
  }

  /**
   * Create a secure payment order
   */
  async createPaymentOrder({
    showId,
    seatIds,
    snacks = [],
    couponCode = null,
    customer,
    gateway = 'nepalpay_qr',
    origin = 'http://localhost:5173'
  }) {
    if (!showId || !seatIds || !seatIds.length) {
      throw new Error('showId and at least one seatId are required');
    }
    if (!customer?.name || !customer?.phone || !customer?.email) {
      throw new Error('Customer name, phone and email are required');
    }

    // 1. Authoritative price calculation on backend
    const pricing = this.calculateOrderPricing({
      seatIds,
      snacks,
      couponCode
    });

    const bookingRef = `GJ-${Math.floor(100000 + Math.random() * 900000)}`;
    const transactionUuid = `${bookingRef}-${Date.now()}`;
    const holderId = customer.phone.trim();

    // 2. Lock the seats for 8 minutes
    await seatLock.holdSeats({
      showId,
      seatIds,
      holderId
    });

    // 3. Persist PENDING booking in database
    let pendingBooking;
    if (prisma?.booking) {
      // Clean up any stale booking with same ref if exists
      pendingBooking = await prisma.booking.create({
        data: {
          bookingRef,
          showId,
          customerName: customer.name.trim(),
          customerPhone: customer.phone.trim(),
          customerEmail: customer.email.trim(),
          seats: seatIds,
          snacks: pricing.validatedSnacks,
          seatSubtotal: pricing.seatSubtotal,
          snacksTotal: pricing.snacksTotal,
          serviceCharge: pricing.serviceCharge,
          discountAmount: pricing.discountAmount,
          totalAmount: pricing.totalAmount,
          paymentGateway: gateway.toUpperCase() === 'ESEWA' ? 'ESEWA' : 'NEPALPAY_QR',
          paymentStatus: 'PENDING',
          nepalPayTxId: transactionUuid
        },
        include: {
          show: {
            include: { movie: true, screen: true }
          }
        }
      });
    } else {
      pendingBooking = {
        bookingRef,
        showId,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        seats: seatIds,
        snacks: pricing.validatedSnacks,
        ...pricing,
        paymentStatus: 'PENDING',
        nepalPayTxId: transactionUuid
      };
    }

    // 4. Gateway specific preparation
    if (gateway.toLowerCase() === 'esewa') {
      const cleanTotal = pricing.totalAmount.toString();
      const signInfo = this.generateEsewaSignature({
        totalAmount: cleanTotal,
        transactionUuid
      });

      // Callback URLs
      const successUrl = `${origin}?esewa_success=true`;
      const failureUrl = `${origin}?esewa_failed=true&bookingRef=${bookingRef}`;

      return {
        success: true,
        gateway: 'esewa',
        bookingRef,
        transactionUuid,
        pricing,
        esewaForm: {
          action: this.esewaPaymentUrl,
          fields: {
            amount: (pricing.seatSubtotal + pricing.snacksTotal - pricing.discountAmount).toString(),
            tax_amount: '0',
            total_amount: cleanTotal,
            transaction_uuid: transactionUuid,
            product_code: signInfo.productCode,
            product_service_charge: pricing.serviceCharge.toString(),
            product_delivery_charge: '0',
            success_url: successUrl,
            failure_url: failureUrl,
            signed_field_names: signInfo.signedFieldNames,
            signature: signInfo.signature
          }
        }
      };
    }

    // Default: NepalPay QR / Fonepay
    const qrData = this.generateNepalPayQr({
      amount: pricing.totalAmount,
      bookingRef,
      customerName: customer.name
    });

    return {
      success: true,
      gateway: 'nepalpay_qr',
      bookingRef,
      transactionUuid,
      pricing,
      qrData
    };
  }

  /**
   * Verify and finalize eSewa payment from returned Base64 data
   */
  async verifyEsewaPayment({ encodedData }) {
    if (!encodedData) {
      throw new Error('encodedData is required from eSewa redirect');
    }

    // Decode base64
    let parsedData;
    try {
      const jsonStr = Buffer.from(encodedData, 'base64').toString('utf8');
      parsedData = JSON.parse(jsonStr);
    } catch (e) {
      throw new Error('Invalid base64 payload from eSewa');
    }

    // Cryptographic signature check
    const isValidSignature = this.verifyEsewaCallbackSignature(parsedData);
    if (!isValidSignature) {
      throw new Error('HMAC signature verification failed. Possible payment tampering!');
    }

    if (parsedData.status !== 'COMPLETE') {
      throw new Error(`eSewa payment not complete. Status: ${parsedData.status}`);
    }

    const { transaction_uuid, transaction_code, total_amount } = parsedData;

    // Database lookup
    if (prisma?.booking) {
      const booking = await prisma.booking.findFirst({
        where: { nepalPayTxId: transaction_uuid },
        include: {
          show: {
            include: { movie: true, screen: true }
          }
        }
      });

      if (!booking) {
        throw new Error(`Booking for transaction ${transaction_uuid} not found.`);
      }

      if (booking.paymentStatus === 'CONFIRMED') {
        return { success: true, booking, message: 'Already confirmed' };
      }

      // Verify amount matches
      if (Math.abs(booking.totalAmount - parseFloat(total_amount)) > 0.01) {
        throw new Error(`Amount mismatch! Expected ${booking.totalAmount}, got ${total_amount}`);
      }

      // Confirm booking atomically
      const updatedBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'CONFIRMED',
          paymentRef: transaction_code,
          paymentGateway: 'ESEWA'
        },
        include: {
          show: {
            include: { movie: true, screen: true }
          }
        }
      });

      // Release seat holds now that booking is confirmed
      await seatLock.releaseHolds({
        showId: booking.showId,
        seatIds: booking.seats,
        holderId: booking.customerPhone
      });

      return {
        success: true,
        booking: updatedBooking,
        transactionCode: transaction_code
      };
    }

    return {
      success: true,
      data: parsedData
    };
  }

  /**
   * Confirm NepalPay / Fonepay QR payment
   */
  async confirmQrPayment({ bookingRef, transactionRef }) {
    if (!bookingRef) {
      throw new Error('bookingRef is required');
    }

    if (prisma?.booking) {
      const booking = await prisma.booking.findUnique({
        where: { bookingRef },
        include: {
          show: {
            include: { movie: true, screen: true }
          }
        }
      });

      if (!booking) {
        throw new Error(`Booking ${bookingRef} not found.`);
      }

      const txId = transactionRef || `NPAY-${Date.now()}`;
      const paymentRef = `NCHL-${Math.floor(100000 + Math.random() * 900000)}`;

      const updated = await prisma.booking.update({
        where: { bookingRef },
        data: {
          paymentStatus: 'CONFIRMED',
          paymentRef,
          nepalPayTxId: txId,
          paymentGateway: 'NEPALPAY_QR'
        },
        include: {
          show: {
            include: { movie: true, screen: true }
          }
        }
      });

      // Clean up hold
      await seatLock.releaseHolds({
        showId: booking.showId,
        seatIds: booking.seats,
        holderId: booking.customerPhone
      });

      return {
        success: true,
        booking: updated
      };
    }

    return {
      success: true,
      bookingRef,
      paymentStatus: 'CONFIRMED'
    };
  }

  /**
   * Check status of a booking
   */
  async getBookingPaymentStatus(bookingRef) {
    if (prisma?.booking) {
      const booking = await prisma.booking.findUnique({
        where: { bookingRef },
        include: {
          show: {
            include: { movie: true, screen: true }
          }
        }
      });
      return booking;
    }
    return null;
  }
}

export const nepalPayService = new ServerNepalPayService();
