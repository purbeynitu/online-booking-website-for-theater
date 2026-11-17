import React, { useState } from 'react';
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
import Footer from './components/Footer';

export default function App() {
  const { currentView, setCurrentView, bookingDetails } = useBooking();
  const [bookingStep, setBookingStep] = useState(1); // 1: showtime, 2: seats, 3: snacks, 4: checkout

  // Render appropriate view
  const renderContent = () => {
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
      <main className="flex-1">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}
