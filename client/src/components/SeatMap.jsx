import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, ShieldCheck, Zap } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { SEAT_CATEGORIES } from '../data/mockData';
import {
  apiFindOrCreateShow,
  apiGetSeatsForShow,
  apiHoldSeats,
  apiReleaseSeats
} from '../services/api';

export default function SeatMap({ onBack, onNext }) {
  const {
    bookingDetails,
    toggleSeat,
    calculateSeatSubtotal,
    hallInfo,
    holderId,
    backendStatus
  } = useBooking();

  const [dbBookedSeats, setDbBookedSeats] = useState([]);
  const [dbHeldSeats, setDbHeldSeats] = useState([]);
  const [activeShowId, setActiveShowId] = useState(null);

  // Fetch live seat status from Supabase backend
  useEffect(() => {
    let isMounted = true;
    const fetchLiveSeats = async () => {
      try {
        const res = await apiFindOrCreateShow({
          movieId: bookingDetails.movie?.id,
          screenName: bookingDetails.screen,
          date: bookingDetails.date,
          startTime: bookingDetails.showtime
        });
        if (res && res.data && res.data.id) {
          if (isMounted) setActiveShowId(res.data.id);
          const seatRes = await apiGetSeatsForShow(res.data.id);
          if (isMounted && seatRes && seatRes.success) {
            setDbBookedSeats(seatRes.bookedSeats || []);
            setDbHeldSeats(seatRes.heldSeats || []);
          }
        }
      } catch (err) {
        console.warn('Real-time seat telemetry note:', err.message);
      }
    };

    fetchLiveSeats();
    return () => { isMounted = false; };
  }, [bookingDetails.date, bookingDetails.showtime, bookingDetails.movie?.id, bookingDetails.screen]);

  // Pseudo-random baseline occupancy for Girija Hall
  const baselineBookedIds = useMemo(() => {
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

  // Combined booked seats including live Supabase bookings and active holds
  const allOccupiedSeats = useMemo(() => {
    const combined = new Set(baselineBookedIds);
    dbBookedSeats.forEach(s => combined.add(s));
    dbHeldSeats.forEach(h => {
      if (h.holderId !== holderId) combined.add(h.seatId);
    });
    return combined;
  }, [baselineBookedIds, dbBookedSeats, dbHeldSeats, holderId]);

  const selectedCount = bookingDetails.seats.length;
  const subtotal = calculateSeatSubtotal();

  const handleSeatClick = async (row, number, category) => {
    const seatId = `${row}${number}`;
    if (allOccupiedSeats.has(seatId)) return;

    const isAlreadySelected = bookingDetails.seats.some(s => s.id === seatId);

    // Call ACID seat hold / release on backend
    if (activeShowId) {
      try {
        if (!isAlreadySelected) {
          await apiHoldSeats({
            showId: activeShowId,
            seatIds: [seatId],
            holderId
          });
        } else {
          await apiReleaseSeats({
            showId: activeShowId,
            seatIds: [seatId],
            holderId
          });
        }
      } catch (e) {
        console.warn('Seat lock API note:', e.message);
      }
    }

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
                      const isBooked = allOccupiedSeats.has(seatId);
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
                      const isBooked = allOccupiedSeats.has(seatId);
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
