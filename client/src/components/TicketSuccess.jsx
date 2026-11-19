import React from 'react';
import { CheckCircle2, Printer, Film, MapPin, ArrowLeft, Phone, ShieldCheck, Ticket } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
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

  const qrTicketValue = JSON.stringify({
    ref: completedTicket.bookingId,
    movie: completedTicket.movieTitle,
    screen: completedTicket.screen,
    showtime: `${completedTicket.date} ${completedTicket.time}`,
    seats: completedTicket.seats,
    status: completedTicket.status || 'CONFIRMED'
  });

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
          नेपाल पे (NepalPay / eSewa) मार्फत तपाईंको भुक्तानी स्वीकृत भएको छ। तपाईंको इ-टिकट र SMS <strong className="text-white">{completedTicket.customerPhone}</strong> मा सुरक्षित गरिएको छ।
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
              Tx: {completedTicket.nepalPayTxId || completedTicket.paymentRef || 'NPAY-OK'}
            </div>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <div className="md:col-span-8 flex gap-5">
            {completedTicket.moviePoster && (
              <img
                src={completedTicket.moviePoster}
                alt={completedTicket.movieTitle}
                className="w-24 sm:w-28 h-36 sm:h-40 object-cover rounded-xl border border-slate-700 shadow-md print:hidden"
              />
            )}
            <div className="space-y-1.5 flex-1">
              <span className="bg-slate-800 text-slate-300 print:bg-slate-200 print:text-black text-[11px] font-bold px-2 py-0.5 rounded">
                {completedTicket.format || '2D Digital'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white print:text-black leading-tight">
                {completedTicket.movieTitle}
              </h3>
              {completedTicket.nepaliTitle && (
                <div className="text-xs text-amber-400 font-serif font-bold">{completedTicket.nepaliTitle}</div>
              )}
              <p className="text-xs text-slate-400 print:text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{completedTicket.address || hallInfo?.address || 'Station Road, Janakpurdham'}</span>
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

          {/* Scannable Gate QR Code & Seats */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950/80 print:bg-slate-50 rounded-2xl border border-slate-800 print:border-slate-200 text-center space-y-2">
            <div className="p-2.5 bg-white rounded-xl shadow-lg border border-slate-200 flex items-center justify-center">
              <QRCodeSVG
                value={qrTicketValue}
                size={100}
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="text-[10px] text-slate-400 print:text-slate-600 font-mono">
              हल प्रवेशद्वारमा यो QR देखाउनुहोस्
            </div>
            <div className="pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">आरक्षित सिट (Seats)</span>
              <span className="text-base font-extrabold text-white print:text-black">
                {Array.isArray(completedTicket.seats) ? completedTicket.seats.join(', ') : completedTicket.seats}
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
                {(completedTicket.gateway || 'NepalPay').replace('_', ' ')}
              </strong>
            </div>
            <div>
              <span>कुल भुक्तानी: </span>
              <strong className="text-rose-400 print:text-black text-sm">रू {completedTicket.totalAmount}</strong>
            </div>
          </div>

          {completedTicket.snacks && completedTicket.snacks.length > 0 && (
            <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 print:border-slate-300">
              <span className="font-semibold text-slate-300 print:text-black">क्यान्टिन अर्डर: </span>
              {completedTicket.snacks.map(s => `${s.name} (x${s.quantity})`).join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="no-print flex flex-col sm:flex-row gap-3 justify-center items-center">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4 text-rose-500" />
          <span>टिकट प्रिन्ट / PDF सेभ गर्नुहोस् (Print Ticket)</span>
        </button>

        <button
          onClick={() => setCurrentView('home')}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>अर्को चलचित्र हेर्नुहोस् (Back to Movies)</span>
        </button>
      </div>

      {/* Entry Policy & Help */}
      <div className="no-print bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1 text-center">
        <p className="font-semibold text-slate-300">
          ⚠️ प्रवेश नियम: शो सुरु हुनुभन्दा १५ मिनेट अगावै हलमा उपस्थित हुनुहोला।
        </p>
        <p>
          कुनै समस्या भएमा गिरिजा सिनेमा हलको सम्पर्क नं <strong>041-520123</strong> वा <strong>9801234567</strong> मा सम्पर्क गर्नुहोस्।
        </p>
      </div>

    </div>
  );
}
