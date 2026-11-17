import React from 'react';
import { Calendar, MapPin, Sparkles, Clock, Check, ChevronRight } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function ShowtimeSelector({ onNext }) {
  const {
    bookingDetails,
    setBookingDetails,
    theatres,
    selectedCity,
    cities
  } = useBooking();

  const movie = bookingDetails.movie;
  if (!movie) return null;

  // Generate next 6 dates
  const dates = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    return { iso, dayName, dayNumber, month };
  });

  const cityTheatres = theatres.filter(t => t.cityId === selectedCity);
  const activeTheatres = cityTheatres.length > 0 ? cityTheatres : theatres;

  const handleSelectTime = (theatre, time, screen) => {
    setBookingDetails(prev => ({
      ...prev,
      theatre,
      showtime: time,
      screen: screen || theatre.screens[0]
    }));
  };

  const handleSelectDate = (iso) => {
    setBookingDetails(prev => ({
      ...prev,
      date: iso
    }));
  };

  const handleSelectFormat = (fmt) => {
    setBookingDetails(prev => ({
      ...prev,
      format: fmt
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Step Header */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-16 h-24 object-cover rounded-xl border border-slate-700 shadow-md"
            />
            <div>
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                Step 1 of 3: Select Date & Show
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-0.5">{movie.title}</h2>
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

          {/* Formats Switcher */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="text-xs font-semibold text-slate-400">Format:</span>
            {movie.formats.map((fmt) => (
              <button
                key={fmt}
                onClick={() => handleSelectFormat(fmt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  bookingDetails.format === fmt
                    ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Date Carousel */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-rose-500" />
          <span>Select Date</span>
        </h3>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {dates.map((d) => {
            const isSelected = bookingDetails.date === d.iso;
            return (
              <button
                key={d.iso}
                onClick={() => handleSelectDate(d.iso)}
                className={`flex flex-col items-center justify-center min-w-[85px] py-3 px-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-rose-600 to-rose-700 text-white border-rose-500 shadow-lg shadow-rose-900/40 scale-105'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span className="text-[11px] font-semibold uppercase">{d.dayName}</span>
                <span className="text-xl font-extrabold my-0.5">{d.dayNumber}</span>
                <span className="text-[10px] font-medium uppercase tracking-wider">{d.month}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theatres & Showtimes List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-rose-500" />
          <span>Theatres & Timings</span>
        </h3>

        <div className="space-y-4">
          {activeTheatres.map((theatre) => {
            const isTheatreSelected = bookingDetails.theatre?.id === theatre.id;

            return (
              <div
                key={theatre.id}
                className={`p-6 rounded-2xl border transition-all ${
                  isTheatreSelected
                    ? 'bg-slate-900/90 border-rose-500/50 shadow-md'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{theatre.name}</span>
                      {isTheatreSelected && (
                        <span className="bg-rose-600/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                          Selected Cinema
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{theatre.location}</span>
                    </p>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5">
                    {theatre.amenities.map((amenity, idx) => (
                      <span key={idx} className="text-[11px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Showtimes Pills */}
                <div className="pt-4 flex flex-wrap items-center gap-3">
                  {theatre.showtimes.map((time, idx) => {
                    const isTimeSelected = isTheatreSelected && bookingDetails.showtime === time;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectTime(theatre, time, theatre.screens[0])}
                        className={`group px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex flex-col items-center ${
                          isTimeSelected
                            ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/40 scale-105'
                            : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:border-rose-500/60 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-sm font-extrabold">{time}</span>
                        <span className="text-[10px] font-normal opacity-80 mt-0.5">
                          {theatre.screens[0].split(' ')[0]} • 4K Laser
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

      {/* Bottom Continue Button */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <div>
          <span className="text-xs text-slate-400">Selected Show:</span>
          <div className="text-sm font-bold text-white">
            {bookingDetails.theatre?.name} • {bookingDetails.showtime} ({bookingDetails.format})
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={!bookingDetails.showtime}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-7 py-3 rounded-xl shadow-lg shadow-rose-600/30 transition-all"
        >
          <span>Select Seats</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
