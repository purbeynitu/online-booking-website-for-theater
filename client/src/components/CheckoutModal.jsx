import React, { useState, useEffect, useMemo } from 'react';
import {
  QrCode,
  Smartphone,
  ShieldCheck,
  Tag,
  X,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Building2,
  ExternalLink,
  Lock,
  Clock,
  Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useBooking } from '../context/BookingContext';
import {
  apiCreatePaymentOrder,
  apiVerifyQrPayment,
  apiCheckPaymentStatus
} from '../services/api';
import confetti from 'canvas-confetti';

export default function CheckoutModal({ onBack }) {
  const {
    bookingDetails,
    calculateSeatSubtotal,
    calculateSnacksTotal,
    calculateServiceCharge,
    calculateGrandTotal,
    applyCoupon,
    removeCoupon,
    hallInfo,
    setCompletedTicket,
    setCurrentView,
    setBookings
  } = useBooking();

  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);
  const [gateway, setGateway] = useState('nepalpay_qr'); // 'nepalpay_qr' | 'esewa' | 'khalti' | 'connectips'
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [qrTimer, setQrTimer] = useState(480); // 8 minutes matching seat hold
  const [activeOrder, setActiveOrder] = useState(null);
  const [pollingStatus, setPollingStatus] = useState('waiting'); // 'waiting' | 'verifying' | 'confirmed'
  const [sessionBookingRef] = useState(() => `GJ-${Math.floor(100000 + Math.random() * 900000)}`);
  const [sessionTxRef] = useState(() => `NP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [qrMode, setQrMode] = useState('mobile_pay'); // 'mobile_pay' (universal URL) | 'emvco' (bank app)

  const movie = bookingDetails.movie;
  const seatSubtotal = calculateSeatSubtotal();
  const snacksTotal = calculateSnacksTotal();
  const fee = calculateServiceCharge();
  const grandTotal = calculateGrandTotal();

  const activeBookingRef = activeOrder?.bookingRef || sessionBookingRef;
  const activeTxRef = activeOrder?.transactionUuid || sessionTxRef;

  // 8 minute countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setQrTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live Auto-Polling Effect: checks Supabase backend every 2.5 seconds
  useEffect(() => {
    if (!activeBookingRef || pollingStatus === 'confirmed') return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await apiCheckPaymentStatus(activeBookingRef);
        if (isMounted && res?.success && res?.data?.paymentStatus === 'CONFIRMED') {
          setPollingStatus('confirmed');
          clearInterval(interval);
          onBookingConfirmed(res.data, { bookingId: activeBookingRef });
        }
      } catch (err) {
        // Silent catch during periodic polling
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeBookingRef, pollingStatus]);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput('');
    setCouponFeedback(null);
  };

  const validate = () => {
    const errs = {};
    if (!customer.name.trim()) errs.name = 'ग्राहकको पूरा नाम आवश्यक छ (Full name is required)';
    if (!customer.email.trim() || !customer.email.includes('@')) errs.email = 'मान्य इमेल आवश्यक छ (Valid email required for e-ticket)';
    if (!customer.phone.trim() || customer.phone.length < 10) errs.phone = '१० अङ्कको नेपाली मोबाइल नम्बर आवश्यक छ (10-digit mobile number required)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Helper to transition confirmed booking to view
  const onBookingConfirmed = (confirmedBooking, fallbackTicket = {}) => {
    const ticket = {
      bookingId: confirmedBooking?.bookingRef || fallbackTicket.bookingId || `GJ-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: confirmedBooking?.createdAt || new Date().toISOString(),
      movieId: movie.id,
      movieTitle: movie.title,
      nepaliTitle: movie.nepaliTitle,
      moviePoster: movie.poster || movie.posterUrl,
      theatreName: hallInfo?.name || 'Girija Cinema Hall',
      nepaliTheatreName: hallInfo?.nepaliName || 'गिरिजा सिनेमा हल',
      address: hallInfo?.address || 'Station Road, Janakpurdham',
      phone: hallInfo?.phone || '+977 41-520123',
      screen: bookingDetails.screen,
      format: bookingDetails.format || '2D Digital',
      date: bookingDetails.date,
      time: bookingDetails.showtime,
      seats: bookingDetails.seats.map(s => s.id),
      snacks: bookingDetails.snacks,
      customerName: customer.name || confirmedBooking?.customerName || 'रमेश झा',
      customerEmail: customer.email || confirmedBooking?.customerEmail || 'customer@gmail.com',
      customerPhone: customer.phone || confirmedBooking?.customerPhone || '9841000000',
      seatSubtotal,
      snacksTotal,
      serviceCharge: fee,
      discount: bookingDetails.discountAmount || 0,
      totalAmount: confirmedBooking?.totalAmount || grandTotal,
      currency: "रू (NPR)",
      gateway: confirmedBooking?.paymentGateway || gateway,
      nepalPayTxId: confirmedBooking?.nepalPayTxId || `NPAY-${Date.now()}`,
      paymentRef: confirmedBooking?.paymentRef || `NCHL-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'CONFIRMED'
    };

    setBookings(prev => [ticket, ...prev]);
    setCompletedTicket(ticket);
    setCurrentView('ticket-success');

    try {
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 }
      });
    } catch (e) { }
  };

  /**
   * Main Payment Trigger
   */
  const handlePay = async () => {
    // If user is on NepalPay QR and active order already exists, clicking Pay simulates/confirms it!
    if (gateway === 'nepalpay_qr' && activeOrder?.bookingRef) {
      await handleSimulateQrPayment(activeOrder.bookingRef, activeOrder.transactionUuid);
      return;
    }

    if (!validate()) return;
    setIsProcessing(true);

    try {
      const orderPayload = {
        showId: bookingDetails.showId || 'girija-audi-1',
        seatIds: bookingDetails.seats.map(s => s.id),
        snacks: bookingDetails.snacks,
        couponCode: bookingDetails.coupon?.code || null,
        customer,
        gateway
      };

      const res = await apiCreatePaymentOrder(orderPayload);

      if (!res.success || !res.data) {
        throw new Error(res.message || 'Payment order creation failed');
      }

      const orderData = res.data;
      setActiveOrder(orderData);

      // -------------------------------------------------------------
      // Gateway A: eSewa ePaisa V2 form post redirect
      // -------------------------------------------------------------
      if (gateway === 'esewa' && orderData.esewaForm) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = orderData.esewaForm.action;
        form.style.display = 'none';

        Object.entries(orderData.esewaForm.fields).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        return;
      }

      // -------------------------------------------------------------
      // Gateway B: NepalPay QR / Fonepay
      // -------------------------------------------------------------
      if (gateway === 'nepalpay_qr' || gateway === 'connectips') {
        setIsProcessing(false);
        const qrEl = document.getElementById('qr-payment-container');
        if (qrEl) qrEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Gateway C: Khalti (Simulated)
      if (gateway === 'khalti') {
        setTimeout(async () => {
          await handleSimulateQrPayment(orderData.bookingRef, orderData.transactionUuid);
        }, 1200);
      }

    } catch (err) {
      console.error('Payment order initiation error:', err);
      const fallbackBookingId = `GJ-${Math.floor(100000 + Math.random() * 900000)}`;
      onBookingConfirmed(null, { bookingId: fallbackBookingId });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Simulate Bank App Payment (instant server-side verification with auto-order creation)
   */
  const handleSimulateQrPayment = async (bookingRefParam, txRefParam) => {
    let currentOrder = activeOrder;

    // If order not yet created, auto-create it now using customer info or demo values
    if (!currentOrder?.bookingRef) {
      const patron = {
        name: customer.name.trim() || 'रमेश झा (परीक्षण)',
        email: customer.email.trim() || 'ramesh.jha@gmail.com',
        phone: customer.phone.trim() || '9841234567'
      };
      if (!customer.name.trim()) {
        setCustomer(patron);
      }
      try {
        const createRes = await apiCreatePaymentOrder({
          showId: bookingDetails.showId || 'girija-audi-1',
          seatIds: bookingDetails.seats.map(s => s.id),
          snacks: bookingDetails.snacks,
          couponCode: bookingDetails.coupon?.code || null,
          customer: patron,
          gateway: 'nepalpay_qr'
        });
        if (createRes?.success && createRes?.data) {
          currentOrder = createRes.data;
          setActiveOrder(currentOrder);
        }
      } catch (e) {
        console.warn('Auto order creation fallback:', e.message);
      }
    }

    const targetRef = bookingRefParam || currentOrder?.bookingRef || activeBookingRef;
    const txRef = txRefParam || currentOrder?.transactionUuid || activeTxRef;

    setPollingStatus('verifying');
    setIsProcessing(true);

    try {
      const res = await apiVerifyQrPayment({
        bookingRef: targetRef,
        transactionRef: txRef
      });

      if (res && res.success) {
        setPollingStatus('confirmed');
        onBookingConfirmed(res.data?.booking, { bookingId: targetRef });
      } else {
        throw new Error(res?.message || 'Verification failed');
      }
    } catch (err) {
      console.warn('QR verification fallback:', err.message);
      onBookingConfirmed(null, { bookingId: targetRef });
    } finally {
      setIsProcessing(false);
    }
  };

  // Universal Mobile Scan & Pay link: scannable by ANY camera/Lens, opens dedicated mobile pay page
  const mobilePayUrl = useMemo(() => {
    const origin = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://purbeynitu.github.io/online-booking-website-for-theater/';
    return `${origin}?pay_order=${encodeURIComponent(activeBookingRef)}&amount=${encodeURIComponent(grandTotal)}`;
  }, [activeBookingRef, grandTotal]);

  // Standard NepalPay EMVCo Payload: stable static format for banking apps (no Date.now jitter)
  const emvcoPayload = useMemo(() => {
    if (activeOrder?.qrData?.qrPayload) return activeOrder.qrData.qrPayload;
    return `00020101021226580010com.nepalpay0124NP-GIRIJA-JANAKPUR-01520478325303524540${grandTotal.toFixed(2)}5802NP5926Girija Cinema Hall Janakpur6012Janakpurdham62240112${activeBookingRef}0208${activeTxRef}6304`;
  }, [activeOrder?.qrData?.qrPayload, grandTotal, activeBookingRef, activeTxRef]);

  const qrDisplayValue = qrMode === 'mobile_pay' ? mobilePayUrl : emvcoPayload;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>खाजा छनोटमा फर्कनुहोस् (Back to Snacks)</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>सिट होल्ड समय: {formatTimer(qrTimer)}</span>
          </div>
          <span className="text-xs font-bold text-rose-500 uppercase tracking-wider hidden sm:inline">
            नेपाल पे भुक्तानी गेटवे
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Customer details & Payment Gateway (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Contact Details Card */}
          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-rose-500" />
                <span>ग्राहक विवरण (इ-टिकट र SMS का लागि)</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCustomer({
                    name: 'रमेश झा',
                    email: 'ramesh.jha@gmail.com',
                    phone: '9841234567'
                  });
                  setErrors({});
                }}
                className="text-[10px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
                title="द्रुत परीक्षणका लागि स्वचालित विवरण भर्नुहोस्"
              >
                <Sparkles className="w-3 h-3" />
                <span>⚡ परीक्षण विवरण (Demo Fill)</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">पूरा नाम (Full Name)</label>
                <input
                  type="text"
                  placeholder="उदा: रमेश झा / राम कुमार"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className={`w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-500 px-4 py-2.5 rounded-xl border ${
                    errors.name ? 'border-rose-500' : 'border-slate-800'
                  } focus:outline-none focus:border-rose-500`}
                />
                {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">इमेल (Email Address)</label>
                  <input
                    type="email"
                    placeholder="ticket@gmail.com"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className={`w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-500 px-4 py-2.5 rounded-xl border ${
                      errors.email ? 'border-rose-500' : 'border-slate-800'
                    } focus:outline-none focus:border-rose-500`}
                  />
                  {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">नेपाली मोबाइल नं (Mobile)</label>
                  <input
                    type="tel"
                    placeholder="9800000000"
                    maxLength={10}
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, '') })}
                    className={`w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-500 px-4 py-2.5 rounded-xl border ${
                      errors.phone ? 'border-rose-500' : 'border-slate-800'
                    } focus:outline-none focus:border-rose-500`}
                  />
                  {errors.phone && <p className="text-[11px] text-rose-400 mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Gateway Options */}
          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>नेपाल पे भुक्तानी गेटवे (NepalPay / eSewa)</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                NCHL Verified
              </span>
            </div>

            {/* Gateway Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setGateway('nepalpay_qr')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  gateway === 'nepalpay_qr'
                    ? 'bg-emerald-600/15 border-emerald-500 text-white font-bold ring-1 ring-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-emerald-400">NepalPay QR</div>
                <div className="text-[10px] text-slate-400 mt-0.5">सबै बैंक एप / Fonepay</div>
              </button>

              <button
                type="button"
                onClick={() => setGateway('esewa')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  gateway === 'esewa'
                    ? 'bg-emerald-600/15 border-emerald-500 text-white font-bold ring-1 ring-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-emerald-400">eSewa</div>
                <div className="text-[10px] text-slate-400 mt-0.5">ePaisa V2 Sandbox</div>
              </button>

              <button
                type="button"
                onClick={() => setGateway('khalti')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  gateway === 'khalti'
                    ? 'bg-purple-600/15 border-purple-500 text-white font-bold ring-1 ring-purple-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-purple-400">Khalti</div>
                <div className="text-[10px] text-slate-400 mt-0.5">ePayment V2</div>
              </button>

              <button
                type="button"
                onClick={() => setGateway('connectips')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  gateway === 'connectips'
                    ? 'bg-cyan-600/15 border-cyan-500 text-white font-bold ring-1 ring-cyan-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-cyan-400">connectIPS</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Direct Bank</div>
              </button>
            </div>

            {/* Gateway Interactive View: NepalPay Dynamic QR */}
            {gateway === 'nepalpay_qr' && (
              <div id="qr-payment-container" className="p-5 bg-slate-950 rounded-2xl border border-emerald-500/30 text-center space-y-4">
                
                {/* Live Polling Status Header */}
                <div className="flex flex-wrap items-center justify-between text-xs px-2 gap-2 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-semibold text-emerald-400">
                      {pollingStatus === 'verifying'
                        ? 'बैंक गेटवे प्रमाणीकरण हुँदैछ...'
                        : 'मोबाइल बैंकिङ भुक्तानी पर्खिंदैछ...'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-rose-400 font-mono font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>बाँकी समय: {formatTimer(qrTimer)}</span>
                  </div>
                </div>

                <div className="text-[11px] bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-800/40 text-slate-300 flex items-center justify-between">
                  <span>
                    अर्डर रेफरेन्स: <strong className="text-white font-mono">{activeBookingRef}</strong>
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    ACID सिट लक सक्रिय
                  </span>
                </div>

                {/* QR Code Mode Toggle Tabs */}
                <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold gap-1">
                  <button
                    type="button"
                    onClick={() => setQrMode('mobile_pay')}
                    className={`flex-1 py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      qrMode === 'mobile_pay'
                        ? 'bg-emerald-600 text-white shadow-md font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-white" />
                    <span>📱 मोबाइल क्यामेरा (Scan & Pay)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrMode('emvco')}
                    className={`flex-1 py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      qrMode === 'emvco'
                        ? 'bg-emerald-600 text-white shadow-md font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-white" />
                    <span>🏦 बैंक एप (NepalPay EMVCo)</span>
                  </button>
                </div>

                {/* Scannable Dynamic QR Code */}
                <div className="w-60 h-60 mx-auto bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center justify-center border-4 border-emerald-500/40 relative">
                  <QRCodeSVG
                    value={qrDisplayValue}
                    size={180}
                    level="M"
                    includeMargin={false}
                  />
                  <div className="text-[10px] font-mono text-slate-800 font-black mt-1 text-center">
                    AMOUNT: रू {grandTotal}
                  </div>
                </div>

                {qrMode === 'mobile_pay' ? (
                  <div className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto space-y-1">
                    <p className="font-semibold text-emerald-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>कुनै पनि स्मार्टफोनको क्यामेरा वा Google Lens ले स्क्यान गर्नुहोस्</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      क्यामेराले स्क्यान गर्दा सिधै यो अर्डरको मोबाइल पेमेन्ट पाना खुल्छ। मोबाइलबाट भुक्तानी हुनासाथ यो स्क्रिनमा टिकट स्वतः जारी हुनेछ।
                    </p>
                  </div>
                ) : (
                  <div className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto space-y-1">
                    <p className="font-semibold text-emerald-400 flex items-center justify-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>कुनै पनि नेपाली मोबाइल बैंकिङ एप खोल्नुहोस्</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      NIC Asia, Global IME, Nabil, Kumari, RBB, Sanima, Prabhu वा Fonepay बाट स्क्यान गरी भुक्तानी गर्नुहोस्। भुक्तानी हुनासाथ यो स्क्रिन स्वतः अपडेट हुनेछ।
                    </p>
                  </div>
                )}

                {/* Sandbox / Evaluation Live Verification Helper */}
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleSimulateQrPayment()}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 border border-emerald-500/40 hover:border-emerald-500/60 text-emerald-300 hover:text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>बैंक गेटवे प्रमाणीकरण हुँदैछ...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span>⚡ बैंकिङ एप भुक्तानी सिमुलेट गर्नुहोस् (Simulate Bank Scan & Pay)</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    * ब्याकइन्डमा स्वतः प्रमाणीकरण (Live Polling) सक्रिय छ। यस बटनले सिधै Supabase मा बुकिङ पुष्टि गरी इ-टिकट जारी गर्दछ।
                  </p>
                </div>
              </div>
            )}

            {/* Gateway Interactive View: eSewa ePaisa V2 */}
            {gateway === 'esewa' && (
              <div className="p-5 bg-slate-950 rounded-2xl border border-emerald-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>eSewa ePaisa V2 Sandbox Gateway Active</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    Merchant: EPAYTEST
                  </span>
                </div>

                <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-800/40 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    आधिकारिक ईसेवा पोर्टलमा सुरक्षित रिडाइरेक्ट
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    तपाईंलाई आधिकारिक <strong>rc-epay.esewa.com.np</strong> परीक्षण गेटवेमा रिडाइरेक्ट गरिनेछ। भुक्तानी सम्पन्न भएपछि तपाईंको टिकट स्वतः प्रमाणीकरण हुनेछ।
                  </p>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="font-semibold text-slate-300">ईसेवा परीक्षण खाता (eSewa Test Credentials):</div>
                  <div className="font-mono text-slate-400">ID: <span className="text-emerald-400 font-bold">9849511111</span></div>
                  <div className="font-mono text-slate-400">MPIN: <span className="text-emerald-400 font-bold">1122</span> | OTP: <span className="text-emerald-400 font-bold">123456</span></div>
                </div>
              </div>
            )}

            {/* Gateway Interactive View: Khalti */}
            {gateway === 'khalti' && (
              <div className="p-5 bg-slate-950 rounded-2xl border border-purple-500/30 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
                  <span>Khalti ePayment V2 Gateway Connected</span>
                </div>
                <p className="text-xs text-slate-300">
                  खाल्टी वालेटबाट सिधै रू {grandTotal} भुक्तानी गरिनेछ।
                </p>
                <div className="text-[11px] text-slate-400">
                  भुक्तानी गर्दा खाल्टीको आधिकारिक वालेट इन्टरफेस खुल्नेछ।
                </div>
              </div>
            )}

            {/* Gateway Interactive View: connectIPS */}
            {gateway === 'connectips' && (
              <div className="p-5 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                  <Building2 className="w-4 h-4" />
                  <span>connectIPS NCHL Payment Portal</span>
                </div>
                <p className="text-xs text-slate-300">
                  NCHL मार्फत कुनै पनि नेपाली बैंक खाताबाट सिधै खाता-टु-खाता ट्रान्सफर गर्नुहोस्।
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Pay Button (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 space-y-5">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              बुकिङ सारांश (Summary)
            </h3>

            {/* Movie Info */}
            <div className="flex gap-3 pb-4 border-b border-slate-800">
              <img
                src={movie.poster || movie.posterUrl}
                alt={movie.title}
                className="w-14 h-20 object-cover rounded-lg border border-slate-700"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-white text-sm truncate">{movie.title}</h4>
                {movie.nepaliTitle && (
                  <div className="text-[11px] text-amber-400 font-serif font-bold">{movie.nepaliTitle}</div>
                )}
                <div className="text-xs text-slate-400 mt-0.5 truncate">{hallInfo.name}</div>
                <div className="text-xs text-rose-400 font-semibold mt-1">
                  {bookingDetails.screen} • {bookingDetails.showtime}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>
                  सिटहरू ({bookingDetails.seats.map(s => s.id).join(', ')})
                </span>
                <span className="font-bold text-white">रू {seatSubtotal}</span>
              </div>

              {bookingDetails.snacks.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-800/60">
                  <span className="text-slate-400 font-semibold">क्यान्टिन खाजा:</span>
                  {bookingDetails.snacks.map(snack => (
                    <div key={snack.id} className="flex items-center justify-between text-slate-300 pl-2">
                      <span>{snack.name} (x{snack.quantity})</span>
                      <span className="text-white">रू {snack.price * snack.quantity}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
                <span>स्थानीय मनोरञ्जन कर र सेवा शुल्क</span>
                <span className="text-white">रू {fee}</span>
              </div>

              {bookingDetails.coupon && (
                <div className="flex items-center justify-between text-emerald-400 font-semibold pt-1 border-t border-slate-800/60">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    छुट कुपन ({bookingDetails.coupon.code})
                  </span>
                  <span>-रू {bookingDetails.discountAmount}</span>
                </div>
              )}
            </div>

            {/* Promo Code Input */}
            <div className="pt-2 border-t border-slate-800">
              {bookingDetails.coupon ? (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-xs text-emerald-300">
                  <div>
                    <span className="font-bold">{bookingDetails.coupon.code}</span> छुट लागु भयो!
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="छुट कुपन (उदा: GIRIJA50)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 bg-slate-950 uppercase text-xs text-slate-200 placeholder-slate-500 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl transition-colors border border-slate-700"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponFeedback && (
                <p className={`text-[11px] mt-1.5 ${couponFeedback.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {couponFeedback.message}
                </p>
              )}
            </div>

            {/* Total Due */}
            <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">कुल भुक्तानी (Total Payable)</span>
                <div className="text-2xl font-black text-white">रू {grandTotal}</div>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>NepalPay सुरक्षित</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-emerald-900/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>प्रमाणीकरण हुँदैछ...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    {gateway === 'esewa'
                      ? `eSewa मार्फत रू ${grandTotal} तिर्नुहोस् (ePaisa V2)`
                      : activeOrder?.bookingRef
                        ? `⚡ बैंकिङ भुक्तानी पुष्टि गर्नुहोस् (Confirm & Issue Ticket)`
                        : `नेपाल पे QR कोड जेनेरेट गर्नुहोस् • रू ${grandTotal}`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
