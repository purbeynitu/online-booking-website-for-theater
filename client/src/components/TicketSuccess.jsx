import React from 'react';
import { CheckCircle2, Printer, Film, MapPin, QrCode, ArrowLeft, Phone, ShieldCheck } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function TicketSuccess() {
  const { completedTicket, setCurrentView, hallInfo } = useBooking();

  if (!completedTicket) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <p className="text-slate-400">कुनै हालैको टिकट फेला परेन।</p>
        <button
          onClick={() => setCurrentView('home')}
          className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
        >
          चलचित्र हेर्नुहोस् (Browse Movies)
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-300">
      
      {/* Success Notification Banner */}
      <div className="no-print bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          टिकट बुकिङ सफल भयो! (Booking Confirmed)
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
          नेपाल पे (NepalPay) मार्फत तपाईंको भुक्तानी स्वीकृत भएको छ। तपाईंको इ-टिकट र SMS <strong className="text-white">{completedTicket.customerPhone}</strong> मा पठाइएको छ।
        </p>
      </div>

      {/* Official Printable Cinema Ticket */}
      <div 
        id="printable-ticket" 
        className="relative bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black"
      >
        {/* Ticket Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border-b border-dashed border-slate-700/80 print:bg-none print:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-700 to-amber-500 flex items-center justify-center text-white print:bg-black">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black text-white print:text-black">गिरिजा सिनेमा हल, जनकपुरधाम</span>
              </div>
              <div className="text-[11px] text-slate-400 print:text-slate-600 font-mono">
                Booking Ref: <strong className="text-rose-400 print:text-black">{completedTicket.bookingId}</strong>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="bg-emerald-500/20 text-emerald-300 print:bg-emerald-100 print:text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
              ● भुक्तानी सम्पन्न (CONFIRMED)
            </span>
            <div className="text-[10px] text-slate-400 print:text-slate-500 font-mono mt-1">
              Tx: {completedTicket.nepalPayTxId}
            </div>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <div className="md:col-span-8 flex gap-5">
            <img
              src={completedTicket.moviePoster}
              alt={completedTicket.movieTitle}
              className="w-24 sm:w-28 h-36 sm:h-40 object-cover rounded-xl border border-slate-700 shadow-md print:hidden"
            />
            <div className="space-y-1.5 flex-1">
              <span className="bg-slate-800 text-slate-300 print:bg-slate-200 print:text-black text-[11px] font-bold px-2 py-0.5 rounded">
                {completedTicket.format}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white print:text-black leading-tight">
                {completedTicket.movieTitle}
              </h3>
              {completedTicket.nepaliTitle && (
                <div className="text-xs text-amber-400 font-serif font-bold">{completedTicket.nepaliTitle}</div>
              )}
              <p className="text-xs text-slate-400 print:text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{hallInfo.address}</span>
              </p>
              <p className="text-xs font-semibold text-rose-400 print:text-black">
                {completedTicket.screen}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">शो मिति (Date)</span>
                  <span className="font-bold text-white print:text-black">{completedTicket.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">शो समय (Showtime)</span>
                  <span className="font-bold text-white print:text-black">{completedTicket.time}</span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code & Seats */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950/80 print:bg-slate-50 rounded-2xl border border-slate-800 print:border-slate-200 text-center space-y-2">
            <div className="w-24 h-24 bg-white p-2 rounded-xl shadow flex items-center justify-center">
              <QrCode className="w-20 h-20 text-slate-900" />
            </div>
            <div className="text-[10px] text-slate-400 print:text-slate-600 font-mono">
              हल प्रवेशद्वारमा यो QR देखाउनुहोस्
            </div>
            <div className="pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">आरक्षित सिट (Seats)</span>
              <span className="text-base font-extrabold text-white print:text-black">
                {completedTicket.seats.join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Perforated Separator Visual */}
        <div className="relative flex items-center justify-between px-2">
          <div className="w-5 h-10 bg-slate-950 rounded-r-full -ml-3 border-r border-slate-800 print:hidden" />
          <div className="flex-1 border-b-2 border-dashed border-slate-800 print:border-slate-300 mx-2" />
          <div className="w-5 h-10 bg-slate-950 rounded-l-full -mr-3 border-l border-slate-800 print:hidden" />
        </div>

        {/* Ticket Footer / Receipt */}
        <div className="p-6 sm:p-8 bg-slate-950/60 print:bg-white text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4 text-slate-400 print:text-slate-600">
            <div>
              <span>दर्शकको नाम: </span>
              <strong className="text-white print:text-black">{completedTicket.customerName}</strong>
              <span className="text-slate-500"> ({completedTicket.customerPhone})</span>
            </div>
            <div>
              <span>भुक्तानी माध्यम: </span>
              <strong className="text-white print:text-black uppercase">
                {completedTicket.gateway.replace('_', ' ')} (NepalPay)
              </strong>
            </div>
          </div>

          {completedTicket.snacks && completedTicket.snacks.length > 0 && (
            <div className="text-slate-400 print:text-slate-600 text-[11px]">
              <span>क्यान्टिन अर्डर: </span>
              <strong className="text-white print:text-black">
                {completedTicket.snacks.map(s => `${s.name} (x${s.quantity})`).join(', ')}
              </strong>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 print:border-slate-200">
            <span className="text-slate-400 print:text-slate-600">कुल भुक्तान रकम (Total Paid):</span>
            <span className="text-lg font-black text-emerald-400 print:text-black">रू {completedTicket.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 pt-4">
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>अर्को चलचित्र हेर्नुहोस् (Browse Movies)</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('find-ticket')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
          >
            बुकिङ इतिहास (My Bookings)
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-rose-600/30 transition-all text-xs"
          >
            <Printer className="w-4 h-4" />
            <span>टिकट प्रिन्ट / PDF सेभ गर्नुहोस्</span>
          </button>
        </div>
      </div>
    </div>
  );
}
