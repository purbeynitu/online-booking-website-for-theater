import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { SEAT_CATEGORIES } from '../data/mockData';

export default function SeatMap({ onBack, onNext }) {
  const {
    bookingDetails,
    toggleSeat,
    calculateSeatSubtotal,
    hallInfo
  } = useBooking();

  // Pseudo-random booked seats for Girija Hall
  const bookedSeatIds = useMemo(() => {
    const seed = `${bookingDetails.date}-${bookingDetails.showtime}-${bookingDetails.movie?.id}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const booked = new Set();
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    rows.forEach((r, rIdx) => {
      for (let n = 1; n <= 14; n++) {
        const rand = Math.sin(hash + rIdx * 14 + n) * 10000;
        if (rand - Math.floor(rand) < 0.28) {
          booked.add(`${r}${n}`);
        }
      }
    });
    return booked;
  }, [bookingDetails.date, bookingDetails.showtime, bookingDetails.movie?.id]);

  const selectedCount = bookingDetails.seats.length;
  const subtotal = calculateSeatSubtotal();

  const handleSeatClick = (row, number, category) => {
    const seatId = `${row}${number}`;
    if (bookedSeatIds.has(seatId)) return;

    toggleSeat({
      id: seatId,
      row,
      number,
      category: category.name,
      price: category.price
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Info */}
      <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
            चरण २: आफ्नो सिट छान्नुहोस् (Select Seats)
          </span>
          <h2 className="text-xl font-extrabold text-white">
            {bookingDetails.movie?.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {hallInfo.name} • {bookingDetails.screen} • {bookingDetails.showtime}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700" />
            <span className="text-slate-400">खाली सिट (Available)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-rose-600 border border-rose-500 flex items-center justify-center text-[10px] text-white font-bold">
              ✓
            </div>
            <span className="text-rose-300">छानिएको (Selected)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-slate-800/40 border border-slate-800 text-slate-600 flex items-center justify-center text-[10px]">
              ✕
            </div>
            <span className="text-slate-500">बुक भइसकेको (Occupied)</span>
          </div>
        </div>
      </div>

      {/* Screen Visual */}
      <div className="pt-4 pb-2">
        <div className="curved-screen" />
      </div>

      {/* Seating Layout */}
      <div className="space-y-8 overflow-x-auto pb-6">
        {SEAT_CATEGORIES.map((cat) => (
          <div key={cat.id} className="min-w-[680px] bg-slate-900/30 p-5 rounded-2xl border border-slate-800/60">
            
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {cat.name}
                </span>
                <span className="text-[11px] text-slate-400">({cat.description})</span>
              </div>
              <div className="text-sm font-extrabold text-amber-400">
                रू {cat.price} <span className="text-[10px] font-normal text-slate-400">/ सिट</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {cat.rows.map((row) => (
                <div key={row} className="flex items-center justify-center gap-2">
                  <span className="w-6 text-xs font-bold text-slate-500 text-center">
                    {row}
                  </span>

                  {/* Left Block */}
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                      const seatId = `${row}${num}`;
                      const isBooked = bookedSeatIds.has(seatId);
                      const isSelected = bookingDetails.seats.some(s => s.id === seatId);

                      return (
                        <button
                          key={num}
                          disabled={isBooked}
                          onClick={() => handleSeatClick(row, num, cat)}
                          title={`सिट ${seatId} - रू ${cat.price}`}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center relative ${
                            isSelected
                              ? 'bg-rose-600 text-white border-2 border-rose-400 shadow-md shadow-rose-600/50 scale-105 z-10'
                              : isBooked
                              ? 'bg-slate-900/40 text-slate-600 border border-slate-800/60 cursor-not-allowed'
                              : 'bg-slate-800 text-slate-300 border border-slate-700/80 hover:border-rose-500 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          {isSelected ? '✓' : isBooked ? '✕' : num}
                        </button>
                      );
                    })}
                  </div>

                  {/* Aisle */}
                  <div className="w-8 flex items-center justify-center text-[10px] text-slate-600 font-mono">
                    ||
                  </div>

                  {/* Right Block */}
                  <div className="flex items-center gap-1.5">
                    {[8, 9, 10, 11, 12, 13, 14].map((num) => {
                      const seatId = `${row}${num}`;
                      const isBooked = bookedSeatIds.has(seatId);
                      const isSelected = bookingDetails.seats.some(s => s.id === seatId);

                      return (
                        <button
                          key={num}
                          disabled={isBooked}
                          onClick={() => handleSeatClick(row, num, cat)}
                          title={`सिट ${seatId} - रू ${cat.price}`}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center relative ${
                            isSelected
                              ? 'bg-rose-600 text-white border-2 border-rose-400 shadow-md shadow-rose-600/50 scale-105 z-10'
                              : isBooked
                              ? 'bg-slate-900/40 text-slate-600 border border-slate-800/60 cursor-not-allowed'
                              : 'bg-slate-800 text-slate-300 border border-slate-700/80 hover:border-rose-500 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          {isSelected ? '✓' : isBooked ? '✕' : num}
                        </button>
                      );
                    })}
                  </div>

                  <span className="w-6 text-xs font-bold text-slate-500 text-center">
                    {row}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Bar */}
      <div className="sticky bottom-4 z-40 glass-panel p-4 sm:p-5 rounded-2xl border border-slate-700/80 bg-slate-950/90 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors self-start sm:self-auto"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>शो समय परिवर्तन गर्नुहोस्</span>
        </button>

        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
          <div>
            <div className="text-[11px] text-slate-400">
              {selectedCount > 0 ? (
                <span>छानिएका सिटहरू: <strong className="text-white">{bookingDetails.seats.map(s => s.id).join(', ')}</strong></span>
              ) : (
                <span>कुनै सिट छानिएको छैन</span>
              )}
            </div>
            <div className="text-lg font-black text-white">
              रू {subtotal} <span className="text-xs font-normal text-slate-400">({selectedCount} सिट)</span>
            </div>
          </div>

          <button
            onClick={onNext}
            disabled={selectedCount === 0}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-rose-600/30 transition-all text-xs sm:text-sm"
          >
            <span>क्यान्टिन खाजा छान्नुहोस् (Snacks)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
