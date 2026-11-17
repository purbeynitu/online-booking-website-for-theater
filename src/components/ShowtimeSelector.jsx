import React from 'react';
import { Calendar, MapPin, Clock, ChevronRight, Volume2, Sparkles, Building2 } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function ShowtimeSelector({ onNext }) {
  const {
    bookingDetails,
    setBookingDetails,
    hallInfo
  } = useBooking();

  const movie = bookingDetails.movie;
  if (!movie) return null;

  // Next 6 days
  const dates = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'आज (Today)' : i === 1 ? 'भोलि (Tomorrow)' : d.toLocaleDateString('ne-NP', { weekday: 'short' });
    const dayNumber = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    return { iso, dayName, dayNumber, month };
  });

  const handleSelectScreenTime = (screen, time) => {
    setBookingDetails(prev => ({
      ...prev,
      theatre: hallInfo,
      screen: screen.name,
      showtime: time
    }));
  };

  const handleSelectDate = (iso) => {
    setBookingDetails(prev => ({
      ...prev,
      date: iso
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Info */}
      <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-16 h-24 object-cover rounded-xl border border-slate-700 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                  चरण १: मिति र शो समय छान्नुहोस्
                </span>
                <span className="bg-slate-800 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">
                  गिरिजा हल
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-0.5">{movie.title}</h2>
              {movie.nepaliTitle && (
                <p className="text-xs text-amber-400 font-serif font-bold">{movie.nepaliTitle}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                <span>{movie.language}</span>
                <span>•</span>
                <span>{movie.duration}</span>
                <span>•</span>
                <span>{movie.ageRating}</span>
                <span>•</span>
                <span>{movie.genre.join(', ')}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-white font-bold">
              <Building2 className="w-4 h-4 text-rose-500" />
              <span>{hallInfo.name}</span>
            </div>
            <p className="text-slate-400 text-[11px]">{hallInfo.address}</p>
          </div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-rose-500" />
          <span>शो मिति छान्नुहोस् (Select Date)</span>
        </h3>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {dates.map((d) => {
            const isSelected = bookingDetails.date === d.iso;
            return (
              <button
                key={d.iso}
                onClick={() => handleSelectDate(d.iso)}
                className={`flex flex-col items-center justify-center min-w-[95px] py-3 px-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-rose-600 to-rose-700 text-white border-rose-500 shadow-lg shadow-rose-900/40 scale-105'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span className="text-[10px] font-bold uppercase">{d.dayName}</span>
                <span className="text-xl font-extrabold my-0.5">{d.dayNumber}</span>
                <span className="text-[10px] font-medium uppercase tracking-wider">{d.month}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Screens & Showtimes in Girija Cinema */}
      <div className="space-y-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-rose-500" />
          <span>गिरिजा हलका स्क्रिन र शो समयहरू (Screens & Timings)</span>
        </h3>

        <div className="space-y-4">
          {hallInfo.screens.map((screen) => {
            return (
              <div
                key={screen.id}
                className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/90 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>{screen.name}</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {screen.soundSystem} • {screen.projection} (कुल {screen.capacity} सिट)
                    </p>
                  </div>
                  <div className="text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 self-start sm:self-auto">
                    बाल्कोनी: रू ३०० | डिलक्स: रू २२० | साधारण: रू १५०
                  </div>
                </div>

                {/* Showtimes Pills */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {hallInfo.showtimes.map((time, idx) => {
                    const isTimeSelected =
                      bookingDetails.screen === screen.name &&
                      bookingDetails.showtime === time;

                    const labelMap = {
                      "11:30 AM": "बिहानी शो (Morning)",
                      "02:30 PM": "दिउँसो शो (Matinee)",
                      "05:45 PM": "साँझ शो (Evening)",
                      "08:45 PM": "रात्री शो (Night)"
                    };

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectScreenTime(screen, time)}
                        className={`group px-4 py-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center min-w-[120px] ${
                          isTimeSelected
                            ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/40 scale-105'
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-rose-500 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-sm font-extrabold">{time}</span>
                        <span className="text-[10px] font-medium opacity-85 mt-0.5">
                          {labelMap[time] || "Regular Show"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <div>
          <span className="text-xs text-slate-400">छानिएको शो (Selected Show):</span>
          <div className="text-sm font-bold text-white">
            {bookingDetails.screen} • {bookingDetails.showtime}
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={!bookingDetails.showtime}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-7 py-3 rounded-xl shadow-lg shadow-rose-600/30 transition-all text-xs sm:text-sm"
        >
          <span>सिट छान्नुहोस् (Select Seats)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
