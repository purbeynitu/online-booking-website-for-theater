import React from 'react';
import { Star, Clock, Ticket, Info, Bell, Play } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function MovieCard({ movie }) {
  const { startBooking, setActiveMovie } = useBooking();

  const isComingSoon = movie.status === 'coming-soon';

  return (
    <div className="group relative flex flex-col bg-slate-900/60 rounded-2xl border border-slate-800/80 hover:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/20 hover:-translate-y-1">
      
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Format Badge */}
          <span className="bg-slate-950/80 backdrop-blur-md text-slate-200 text-[11px] font-bold px-2 py-0.5 rounded-md border border-slate-700/80">
            {movie.formats[0]}
          </span>

          {/* Age Rating */}
          <span className="bg-slate-900/90 text-rose-400 text-[11px] font-bold px-2 py-0.5 rounded-md border border-rose-500/30">
            {movie.ageRating}
          </span>
        </div>

        {/* Rating Floating Tag */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-xs font-bold text-amber-300">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{movie.rating}</span>
          <span className="text-[10px] text-slate-400 font-normal">/10</span>
        </div>

        {/* Hover Quick Actions */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
          <button
            onClick={() => setActiveMovie(movie)}
            className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-600 transition-colors shadow"
          >
            <Info className="w-4 h-4 text-rose-400" />
            <span>View Synopsis & Cast</span>
          </button>

          {!isComingSoon ? (
            <button
              onClick={() => startBooking(movie)}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/40 transition-colors"
            >
              <Ticket className="w-4 h-4" />
              <span>Book Show</span>
            </button>
          ) : (
            <button
              onClick={() => alert(`You have subscribed to release notifications for "${movie.title}"!`)}
              className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-amber-500/40 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span>Notify on Release</span>
            </button>
          )}
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-rose-400 transition-colors">
            {movie.title}
          </h3>

          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            <span>{movie.language}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{movie.duration}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {movie.genre.join(', ')}
          </p>
        </div>

        {/* Action Button at Bottom */}
        <div className="pt-2 border-t border-slate-800/60">
          {!isComingSoon ? (
            <button
              onClick={() => startBooking(movie)}
              className="w-full py-2 rounded-lg bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white text-xs font-bold transition-all border border-rose-500/20 hover:border-rose-600 flex items-center justify-center gap-1.5"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Book Tickets</span>
            </button>
          ) : (
            <div className="text-center py-1.5 text-xs text-amber-400/90 font-medium">
              Releasing on {new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
