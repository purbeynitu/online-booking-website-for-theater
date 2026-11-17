import React, { useState } from 'react';
import { CreditCard, QrCode, Smartphone, ShieldCheck, Tag, X, ChevronLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import confetti from 'canvas-confetti';

export default function CheckoutModal({ onBack }) {
  const {
    bookingDetails,
    calculateSeatSubtotal,
    calculateSnacksTotal,
    calculateConvenienceFee,
    calculateGrandTotal,
    applyCoupon,
    removeCoupon,
    finalizeBooking
  } = useBooking();

  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const movie = bookingDetails.movie;
  const theatre = bookingDetails.theatre;
  const seatSubtotal = calculateSeatSubtotal();
  const snacksTotal = calculateSnacksTotal();
  const convFee = calculateConvenienceFee();
  const grandTotal = calculateGrandTotal();

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
    if (!customer.name.trim()) errs.name = 'Full name is required';
    if (!customer.email.trim() || !customer.email.includes('@')) errs.email = 'Valid email is required for ticket delivery';
    if (!customer.phone.trim() || customer.phone.length < 10) errs.phone = '10-digit mobile number required for SMS ticket';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePay = () => {
    if (!validate()) return;

    setIsProcessing(true);

    // Simulate payment gateway delay (1.5s)
    setTimeout(() => {
      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) { }

      setIsProcessing(false);
      finalizeBooking(customer, paymentMethod);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Snacks</span>
        </button>
        <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
          Final Step: Review & Secure Checkout
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Customer Details & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Customer Information Card */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-rose-500" />
              <span>Contact Details (For E-Ticket & SMS)</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Nitup Kumar"
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
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="ticket@example.com"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className={`w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-500 px-4 py-2.5 rounded-xl border ${
                      errors.email ? 'border-rose-500' : 'border-slate-800'
                    } focus:outline-none focus:border-rose-500`}
                  />
                  {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
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

          {/* Payment Method Selector */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-rose-500" />
              <span>Choose Payment Gateway</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  paymentMethod === 'upi'
                    ? 'bg-rose-600/10 border-rose-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <QrCode className="w-5 h-5 text-rose-500" />
                <div>
                  <div className="text-xs font-bold">UPI / QR Code</div>
                  <div className="text-[10px] text-slate-400">GPay, PhonePe, Paytm</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-rose-600/10 border-rose-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 text-rose-500" />
                <div>
                  <div className="text-xs font-bold">Credit / Debit Card</div>
                  <div className="text-[10px] text-slate-400">Visa, Mastercard, RuPay</div>
                </div>
              </button>
            </div>

            {paymentMethod === 'upi' && (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 text-center space-y-2">
                <div className="w-28 h-28 mx-auto bg-white p-2 rounded-lg flex items-center justify-center">
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center text-rose-500 font-mono text-xs font-bold border border-dashed border-slate-400">
                    SCAN & PAY
                  </div>
                </div>
                <p className="text-xs text-slate-400">Scan via any UPI App or click Confirm to simulate payment</p>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-3">
                <input
                  type="text"
                  placeholder="Card Number (4111 2222 3333 4444)"
                  defaultValue="4111 •••• •••• 8892"
                  className="w-full bg-slate-900 text-sm text-slate-200 px-3 py-2 rounded-lg border border-slate-700"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="MM / YY"
                    defaultValue="12/28"
                    className="w-full bg-slate-900 text-sm text-slate-200 px-3 py-2 rounded-lg border border-slate-700"
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    defaultValue="987"
                    maxLength={4}
                    className="w-full bg-slate-900 text-sm text-slate-200 px-3 py-2 rounded-lg border border-slate-700"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Pay Button (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Booking Summary
            </h3>

            {/* Movie Info */}
            <div className="flex gap-3 pb-4 border-b border-slate-800">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-14 h-20 object-cover rounded-lg border border-slate-700"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-white text-sm truncate">{movie.title}</h4>
                <div className="text-xs text-slate-400 mt-0.5">{bookingDetails.format} • {movie.language}</div>
                <div className="text-xs text-slate-400 truncate">{theatre.name}</div>
                <div className="text-xs text-rose-400 font-semibold mt-1">
                  {bookingDetails.date} • {bookingDetails.showtime}
                </div>
              </div>
            </div>

            {/* Seats & Snacks Line Items */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>
                  Seats ({bookingDetails.seats.map(s => s.id).join(', ')})
                </span>
                <span className="font-bold text-white">₹{seatSubtotal}</span>
              </div>

              {bookingDetails.snacks.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-800/60">
                  <span className="text-slate-400 font-semibold">Food & Beverages:</span>
                  {bookingDetails.snacks.map(snack => (
                    <div key={snack.id} className="flex items-center justify-between text-slate-300 pl-2">
                      <span>{snack.name} (x{snack.quantity})</span>
                      <span className="text-white">₹{snack.price * snack.quantity}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
                <span>Convenience Fee & GST (18%)</span>
                <span className="text-white">₹{convFee}</span>
              </div>

              {bookingDetails.coupon && (
                <div className="flex items-center justify-between text-emerald-400 font-semibold pt-1 border-t border-slate-800/60">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Promo ({bookingDetails.coupon.code})
                  </span>
                  <span>-₹{bookingDetails.discountAmount}</span>
                </div>
              )}
            </div>

            {/* Promo Code Input */}
            <div className="pt-2 border-t border-slate-800">
              {bookingDetails.coupon ? (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-xs text-emerald-300">
                  <div>
                    <span className="font-bold">{bookingDetails.coupon.code}</span> applied!
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
                    placeholder="Promo Code (e.g. CINEPASS50)"
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
                <span className="text-xs text-slate-400">Total Payable</span>
                <div className="text-2xl font-black text-white">₹{grandTotal}</div>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Safe & Secure</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 hover:shadow-rose-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authorizing Payment...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{grandTotal} & Confirm Tickets</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
