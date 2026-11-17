import React, { useState, useEffect } from 'react';
import { QrCode, Smartphone, ShieldCheck, Tag, X, ChevronLeft, CheckCircle2, Loader2, Building2, ExternalLink } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { generateNepalPayQr } from '../services/nepalPayService';
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
    finalizeBookingWithNepalPay,
    hallInfo
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
  const [qrTimer, setQrTimer] = useState(300); // 5 min countdown for NepalPay QR

  const movie = bookingDetails.movie;
  const seatSubtotal = calculateSeatSubtotal();
  const snacksTotal = calculateSnacksTotal();
  const fee = calculateServiceCharge();
  const grandTotal = calculateGrandTotal();

  // Generate dynamic NepalPay QR data
  const qrData = generateNepalPayQr({
    amount: grandTotal,
    bookingId: `GJ-${Date.now().toString().slice(-6)}`,
    customerName: customer.name || 'Girija Patron'
  });

  // Countdown timer for NepalPay dynamic QR
  useEffect(() => {
    const timer = setInterval(() => {
      setQrTimer((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    if (!customer.email.trim() || !customer.email.includes('@')) errs.email = 'इ-मेल आवश्यक छ (Valid email required for e-ticket)';
    if (!customer.phone.trim() || customer.phone.length < 10) errs.phone = '१० अङ्कको नेपाली मोबाइल नम्बर आवश्यक छ (10-digit mobile number required)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;

    setIsProcessing(true);

    try {
      await finalizeBookingWithNepalPay(customer, gateway);
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) { }
    } catch (err) {
      alert('Payment processing error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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
          <span>खाजा छनोटमा फर्कनुहोस् (Back to Snacks)</span>
        </button>
        <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
          अन्तिम चरण: नेपाल पे भुक्तानी (NepalPay Gateway)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Customer details & NepalPay Gateway (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Contact Details Card */}
          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-rose-500" />
              <span>ग्राहक विवरण (इ-टिकट र SMS का लागि)</span>
            </h3>

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

          {/* NepalPay Payment Options */}
          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>नेपाल पे भुक्तानी गेटवे (NepalPay)</span>
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
                    ? 'bg-rose-600/15 border-rose-500 text-white font-bold ring-1 ring-rose-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-emerald-400">NepalPay QR</div>
                <div className="text-[10px] text-slate-400 mt-0.5">सबै बैंक एप</div>
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
                <div className="text-[10px] text-slate-400 mt-0.5">ePaisa V2</div>
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

            {/* Gateway Interactive View */}
            {gateway === 'nepalpay_qr' && (
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-3">
                <div className="flex items-center justify-between text-xs px-2 text-slate-400">
                  <span>Merchant: <strong className="text-white">Girija Cinema Hall Janakpur</strong></span>
                  <span className="text-rose-400 font-mono font-bold">समय बाँकी: {formatTimer(qrTimer)}</span>
                </div>

                {/* QR Code Container */}
                <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center justify-center border-4 border-emerald-500/40 relative">
                  <div className="w-full h-full bg-slate-900 rounded-lg flex flex-col items-center justify-center text-center p-2">
                    <QrCode className="w-24 h-24 text-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-mono text-emerald-300 font-bold mt-1">
                      SCAN WITH ANY NEPAL BANK APP
                    </span>
                    <span className="text-[8px] font-mono text-slate-400">
                      Amount: रू {grandTotal}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  <p className="font-semibold text-emerald-400">
                    कुनै पनि नेपाली मोबाइल बैंकिङ एप खोल्नुहोस्
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    NIC Asia, Global IME, Nabil, Kumari, RBB, Sanima, Prabhu वा Fonepay बाट स्क्यान गरी भुक्तानी गर्नुहोस्।
                  </p>
                </div>
              </div>
            )}

            {gateway === 'esewa' && (
              <div className="p-5 bg-slate-950 rounded-2xl border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>eSewa ePaisa V2 Gateway Connected</span>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="eSewa ID (Mobile Number / Email)"
                    defaultValue={customer.phone ? `98${customer.phone.slice(2)}` : '9801234567'}
                    className="w-full bg-slate-900 text-xs text-slate-200 px-3 py-2.5 rounded-xl border border-slate-700"
                  />
                  <input
                    type="password"
                    placeholder="eSewa MPIN / Password"
                    defaultValue="••••"
                    maxLength={6}
                    className="w-full bg-slate-900 text-xs text-slate-200 px-3 py-2.5 rounded-xl border border-slate-700"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  भुक्तानी पुष्टि गर्दा OTP तपाईंको ईसेवा मोबाइलमा आउनेछ।
                </p>
              </div>
            )}

            {gateway === 'khalti' && (
              <div className="p-5 bg-slate-950 rounded-2xl border border-purple-500/30 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
                  <span>Khalti ePayment V2 Gateway Connected</span>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Khalti Mobile Number"
                    defaultValue={customer.phone ? `98${customer.phone.slice(2)}` : '9841000000'}
                    className="w-full bg-slate-900 text-xs text-slate-200 px-3 py-2.5 rounded-xl border border-slate-700"
                  />
                  <input
                    type="password"
                    placeholder="Khalti 4-digit PIN"
                    defaultValue="••••"
                    maxLength={4}
                    className="w-full bg-slate-900 text-xs text-slate-200 px-3 py-2.5 rounded-xl border border-slate-700"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  खाल्टी वालेटबाट सिधै रू {grandTotal} काटिनेछ।
                </p>
              </div>
            )}

            {gateway === 'connectips' && (
              <div className="p-5 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                  <Building2 className="w-4 h-4" />
                  <span>connectIPS NCHL Payment Portal</span>
                </div>
                <input
                  type="text"
                  placeholder="connectIPS Username"
                  defaultValue="girija_customer"
                  className="w-full bg-slate-900 text-xs text-slate-200 px-3 py-2.5 rounded-xl border border-slate-700"
                />
                <p className="text-[11px] text-slate-400">
                  NCHL मार्फत कुनै पनि नेपाली बैंक खाताबाट सिधै ट्रान्सफर गर्नुहोस्।
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
                src={movie.poster}
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
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-emerald-900/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>नेपाल पे मार्फत भुक्तानी हुँदैछ...</span>
                </>
              ) : (
                <>
                  <span>नेपाल पे मार्फत रू {grandTotal} तिर्नुहोस् (Confirm)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
