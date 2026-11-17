import React, { useState, useEffect } from 'react';
import { Play, Ticket, Star, Clock, Sparkles, ChevronLeft, ChevronRight, MapPin, Volume2 } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function HeroBanner() {
  const { movies, startBooking, setActiveMovie, hallInfo } = useBooking();
  const [currentIndex, setCurrentIndex] = useState(0);

  const featuredMovies = movies.filter(m => m.status === 'now-showing').slice(0, 4);

  useEffect(() => {
    if (featuredMovies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  if (featuredMovies.length === 0) return null;

  const current = featuredMovies[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  return (
    <div className="relative w-full h-[520px] md:h-[580px] overflow-hidden bg-slate-950">
      {/* Background Banner with Dark Vignette */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
        style={{ backgroundImage: `url(${current.banner})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#080C14] via-[#080C14]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080C14] via-[#080C14]/85 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16">
        <div className="max-w-2xl space-y-4">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/30 border border-rose-500/50 text-rose-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>गिरिजा सिनेमा हल • जनकपुरधाम विशेष</span>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              {current.title}
            </h1>
            {current.nepaliTitle && (
              <p className="text-base md:text-xl font-bold text-amber-400 mt-1 font-serif">
                {current.nepaliTitle}
              </p>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate-300 font-medium">
            <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-md border border-amber-500/30 font-semibold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{current.rating}</span>
              <span className="text-xs text-amber-300/70 font-normal">({current.votes})</span>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{current.duration}</span>
            </div>

            <span className="text-slate-600">•</span>

            <span className="bg-slate-800 text-slate-200 text-xs px-2 py-0.5 rounded border border-slate-700">
              {current.ageRating}
            </span>

            <span className="text-slate-600">•</span>

            <span className="text-rose-400 font-bold">{current.language}</span>

            <span className="text-slate-600">•</span>

            <span className="text-slate-300">{current.genre.join(', ')}</span>
          </div>

          {/* Synopsis */}
          <p className="text-xs md:text-sm text-slate-300/90 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-xl">
            {current.synopsis}
          </p>

          {/* Hall Audi & Showtimes Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-slate-300">
              <Volume2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Dolby Surround 7.1 • Barco 2K Digital</span>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg font-bold">
              टिकट दर: रू १५० - रू ३००
            </div>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-4 pt-3">
            <button
              onClick={() => startBooking(current)}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-rose-600/40 hover:shadow-rose-600/60 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs sm:text-sm"
            >
              <Ticket className="w-5 h-5" />
              <span>टिकट बुक गर्नुहोस् (Book Tickets)</span>
            </button>

            <button
              onClick={() => setActiveMovie(current)}
              className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold px-5 py-3.5 rounded-xl border border-slate-700/80 backdrop-blur-md transition-all hover:border-slate-600 text-xs sm:text-sm"
            >
              <Play className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>ट्रेलर र विवरण</span>
            </button>
          </div>
        </div>

        {/* Carousel Navigation Arrows & Indicators */}
        <div className="absolute right-6 bottom-10 flex items-center gap-3">
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700/70 text-slate-300 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1.5 px-2">
            {featuredMovies.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx ? 'w-7 bg-rose-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            aria-label="Next slide"
            className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700/70 text-slate-300 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
