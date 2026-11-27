import React, { useState, useEffect } from 'react';
import { useBooking } from './context/BookingContext';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import MovieGrid from './components/MovieGrid';
import MovieDetailModal from './components/MovieDetailModal';
import ShowtimeSelector from './components/ShowtimeSelector';
import SeatMap from './components/SeatMap';
import SnacksSelector from './components/SnacksSelector';
import CheckoutModal from './components/CheckoutModal';
import TicketSuccess from './components/TicketSuccess';
import FindTicket from './components/FindTicket';
import AdminDashboard from './components/AdminDashboard';
import GatekeeperScanner from './components/GatekeeperScanner';
import MobilePaymentModal from './components/MobilePaymentModal';
import Footer from './components/Footer';
import { apiVerifyEsewaPayment } from './services/api';
import confetti from 'canvas-confetti';
import { Loader2 } from 'lucide-react';

export default function App() {
  const {
    currentView,
    setCurrentView,
    bookingDetails,
    setCompletedTicket,
    setBookings,
    hallInfo
  } = useBooking();

  const [bookingStep, setBookingStep] = useState(1); // 1: showtime, 2: seats, 3: snacks, 4: checkout
  const [isVerifyingEsewa, setIsVerifyingEsewa] = useState(false);
  const [esewaMessage, setEsewaMessage] = useState(null);
  const [mobilePayOrder, setMobilePayOrder] = useState(null);

  // Check URL query parameters for eSewa callback on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const esewaData = urlParams.get('data');
    const isEsewaFailed = urlParams.get('esewa_failed');
    const verifyTicketRef = urlParams.get('verifyTicket');
    const payOrderRef = urlParams.get('pay_order') || urlParams.get('pay');
    const payAmount = urlParams.get('amount');

    // Case 1: eSewa ePaisa V2 redirect with Base64 payload
    if (esewaData) {
      setIsVerifyingEsewa(true);

      apiVerifyEsewaPayment(esewaData)
        .then((res) => {
          if (res && res.success && res.data?.booking) {
            const b = res.data.booking;
            const confirmedTicket = {
              bookingId: b.bookingRef,
              createdAt: b.createdAt || new Date().toISOString(),
              movieId: b.show?.movieId || b.showId || 'mov-purna-bahadur',
              movieTitle: b.show?.movie?.title || 'Girija Cinema Feature',
              nepaliTitle: b.show?.movie?.nepaliTitle || '',
              moviePoster: b.show?.movie?.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
              theatreName: hallInfo?.name || 'Girija Cinema Hall',
              nepaliTheatreName: hallInfo?.nepaliName || 'गिरिजा सिनेमा हल',
              address: hallInfo?.address || 'Station Road, Janakpurdham',
              phone: hallInfo?.phone || '+977 41-520123',
              screen: b.show?.screen?.name || 'Audi 1: Main Hall (Dolby Atmos 7.1)',
              format: '2D Digital',
              date: b.show?.date || new Date().toISOString().split('T')[0],
              time: b.show?.startTime || '02:30 PM',
              seats: Array.isArray(b.seats) ? b.seats : [],
              snacks: b.snacks || [],
              customerName: b.customerName,
              customerEmail: b.customerEmail,
              customerPhone: b.customerPhone,
              seatSubtotal: b.seatSubtotal,
              snacksTotal: b.snacksTotal || 0,
              serviceCharge: b.serviceCharge || 20,
              discount: b.discountAmount || 0,
              totalAmount: b.totalAmount,
              currency: 'रू (NPR)',
              gateway: 'eSewa',
              nepalPayTxId: b.nepalPayTxId || res.data.transactionCode,
              paymentRef: b.paymentRef || res.data.transactionCode,
              status: 'CONFIRMED'
            };

            setBookings((prev) => [confirmedTicket, ...prev]);
            setCompletedTicket(confirmedTicket);
            setCurrentView('ticket-success');

            try {
              confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 }
              });
            } catch (e) { }
          }
        })
        .catch((err) => {
          console.error('eSewa callback verification error:', err);
          setEsewaMessage({
            type: 'error',
            text: `ईसेवा प्रमाणीकरण त्रुटि: ${err.message}`
          });
        })
        .finally(() => {
          setIsVerifyingEsewa(false);
          // Clean URL without page reload
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    }

    // Case 2: eSewa payment failure or cancellation
    if (isEsewaFailed) {
      setEsewaMessage({
        type: 'warning',
        text: 'ईसेवा भुक्तानी रद्द वा असफल भयो। तपाईंको सिट केही मिनेटका लागि सुरक्षित रहनेछ।'
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Case 3: Direct ticket verification lookup from QR code scan
    if (verifyTicketRef) {
      setCurrentView('find-ticket');
    }

    // Case 4: Mobile Scan & Pay direct link from QR scan (?pay_order=GJ-XXXXXX)
    if (payOrderRef) {
      setMobilePayOrder({
        bookingRef: payOrderRef,
        amount: payAmount ? Number(payAmount) : null
      });
    }
  }, []);

  // Render appropriate view
  const renderContent = () => {
    if (isVerifyingEsewa) {
      return (
        <div className="max-w-md mx-auto my-24 p-8 bg-slate-900/90 rounded-3xl border border-emerald-500/30 text-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-white">ईसेवा भुक्तानी प्रमाणीकरण हुँदैछ...</h3>
          <p className="text-xs text-slate-400">
            कृपया प्रतीक्षा गर्नुहोस्, गिरिजा सिनेमा हलको सुरक्षित ब्याकइन्डमा ईसेवा HMAC सिग्नेचर जाँच भइरहेको छ।
          </p>
        </div>
      );
    }

    switch (currentView) {
      case 'home':
        return (
          <>
            <HeroBanner />
            <MovieGrid />
            <MovieDetailModal />
          </>
        );

      case 'booking-flow':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Step Wizard Breadcrumbs */}
            <div className="max-w-xl mx-auto mb-8 flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 -z-0" />
              
              {[
                { step: 1, label: 'Showtime' },
                { step: 2, label: 'Seats' },
                { step: 3, label: 'Snacks' },
                { step: 4, label: 'Payment' }
              ].map((s) => (
                <div key={s.step} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      bookingStep === s.step
                        ? 'bg-rose-600 text-white ring-4 ring-rose-600/20 shadow-md shadow-rose-600/40'
                        : bookingStep > s.step
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 border border-slate-700 text-slate-500'
                    }`}
                  >
                    {bookingStep > s.step ? '✓' : s.step}
                  </div>
                  <span className={`text-[11px] font-semibold mt-1 ${
                    bookingStep === s.step ? 'text-white' : 'text-slate-500'
                  }`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Step Components */}
            {bookingStep === 1 && (
              <ShowtimeSelector onNext={() => setBookingStep(2)} />
            )}

            {bookingStep === 2 && (
              <SeatMap
                onBack={() => setBookingStep(1)}
                onNext={() => setBookingStep(3)}
              />
            )}

            {bookingStep === 3 && (
              <SnacksSelector
                onBack={() => setBookingStep(2)}
                onNext={() => setBookingStep(4)}
              />
            )}

            {bookingStep === 4 && (
              <CheckoutModal onBack={() => setBookingStep(3)} />
            )}
          </div>
        );

      case 'ticket-success':
        return <TicketSuccess />;

      case 'find-ticket':
        return <FindTicket />;

      case 'admin':
        return <AdminDashboard />;

      case 'gatekeeper':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <GatekeeperScanner onBack={() => setCurrentView('home')} />
          </div>
        );

      default:
        return (
          <>
            <HeroBanner />
            <MovieGrid />
            <MovieDetailModal />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-slate-100">
      <Navbar />

      {/* Global alert banner for payment callbacks */}
      {esewaMessage && (
        <div className={`p-3 text-xs text-center font-bold flex items-center justify-center gap-2 ${
          esewaMessage.type === 'error'
            ? 'bg-rose-900/60 text-rose-200 border-b border-rose-700'
            : 'bg-amber-900/60 text-amber-200 border-b border-amber-700'
        }`}>
          <span>{esewaMessage.text}</span>
          <button
            onClick={() => setEsewaMessage(null)}
            className="ml-3 underline text-[11px] hover:text-white"
          >
            बन्द गर्नुहोस् (Close)
          </button>
        </div>
      )}

      <main className="flex-1">
        {renderContent()}
      </main>

      {/* Direct Mobile Scan & Pay Modal */}
      {mobilePayOrder && (
        <MobilePaymentModal
          bookingRef={mobilePayOrder.bookingRef}
          initialAmount={mobilePayOrder.amount}
          onSuccess={(confirmedBooking) => {
            const confirmedTicket = {
              bookingId: confirmedBooking?.bookingRef || mobilePayOrder.bookingRef,
              createdAt: confirmedBooking?.createdAt || new Date().toISOString(),
              movieId: confirmedBooking?.show?.movieId || 'mov-purna-bahadur',
              movieTitle: confirmedBooking?.show?.movie?.title || 'Girija Cinema Feature',
              nepaliTitle: confirmedBooking?.show?.movie?.nepaliTitle || 'गिरिजा सिनेमा चलचित्र',
              moviePoster: confirmedBooking?.show?.movie?.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
              theatreName: hallInfo?.name || 'Girija Cinema Hall',
              nepaliTheatreName: hallInfo?.nepaliName || 'गिरिजा सिनेमा हल',
              address: hallInfo?.address || 'Station Road, Janakpurdham',
              phone: hallInfo?.phone || '+977 41-520123',
              screen: confirmedBooking?.show?.screen?.name || 'Audi 1: Main Hall (Dolby Atmos 7.1)',
              format: '2D Digital',
              date: confirmedBooking?.show?.date || new Date().toISOString().split('T')[0],
              time: confirmedBooking?.show?.startTime || '05:45 PM',
              seats: Array.isArray(confirmedBooking?.seats) ? confirmedBooking.seats : ['A1', 'A2'],
              snacks: confirmedBooking?.snacks || [],
              customerName: confirmedBooking?.customerName || 'मोबाइल भुक्तानी ग्राहक',
              customerEmail: confirmedBooking?.customerEmail || 'customer@gmail.com',
              customerPhone: confirmedBooking?.customerPhone || '9841000000',
              seatSubtotal: confirmedBooking?.seatSubtotal || mobilePayOrder.amount || 320,
              snacksTotal: confirmedBooking?.snacksTotal || 0,
              serviceCharge: confirmedBooking?.serviceCharge || 20,
              discount: confirmedBooking?.discountAmount || 0,
              totalAmount: confirmedBooking?.totalAmount || mobilePayOrder.amount || 320,
              currency: 'रू (NPR)',
              gateway: 'NepalPay Mobile Scan',
              nepalPayTxId: confirmedBooking?.nepalPayTxId || `NPAY-${Date.now()}`,
              paymentRef: confirmedBooking?.paymentRef || `NCHL-${Math.floor(100000 + Math.random() * 900000)}`,
              status: 'CONFIRMED'
            };

            setBookings((prev) => [confirmedTicket, ...prev]);
            setCompletedTicket(confirmedTicket);
            setMobilePayOrder(null);
            setCurrentView('ticket-success');
            window.history.replaceState({}, document.title, window.location.pathname);
          }}
          onClose={() => {
            setMobilePayOrder(null);
            window.history.replaceState({}, document.title, window.location.pathname);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
