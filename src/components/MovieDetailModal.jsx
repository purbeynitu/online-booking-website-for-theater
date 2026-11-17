import React, { useEffect } from 'react';
import { X, Star, Clock, Ticket, User } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function MovieDetailModal() {
  const { activeMovie, setActiveMovie, startBooking } = useBooking();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveMovie(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveMovie]);

  if (!activeMovie) return null;

  const handleBook = () => {
    const targetMovie = activeMovie;
    setActiveMovie(null);
    startBooking(targetMovie);
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&mute=0` : null;
  };

  const embedUrl = getEmbedUrl(activeMovie.trailerUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-4xl bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={() => setActiveMovie(null)}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-slate-950/80 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video / Banner Header */}
        <div className="relative w-full h-72 sm:h-96 bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${activeMovie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${activeMovie.banner})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-rose-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {activeMovie.language}
                </span>
                <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-2 py-0.5 rounded border border-slate-700">
                  {activeMovie.ageRating}
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {activeMovie.duration}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {activeMovie.title}
              </h2>

              {activeMovie.nepaliTitle && (
                <p className="text-base sm:text-lg font-bold text-amber-400 font-serif mt-1">
                  {activeMovie.nepaliTitle}
                </p>
              )}

              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {activeMovie.genre.join(' • ')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 px-3.5 py-2 rounded-xl text-amber-300">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <div>
                  <div className="text-base font-bold leading-tight">{activeMovie.rating} / 10</div>
                  <div className="text-[10px] text-amber-400/70">{activeMovie.votes} Ratings</div>
                </div>
              </div>
            </div>
          </div>

          {/* Formats */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-400 self-center mr-2">स्क्रिनिङ:</span>
            {activeMovie.formats.map((fmt, i) => (
              <span key={i} className="text-xs bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1 rounded-lg font-mono">
                {fmt}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              कथावस्तु (Synopsis)
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {activeMovie.synopsis}
            </p>
          </div>

          {/* Cast */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              कलाकार तथा निर्देशक (Cast & Director)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {activeMovie.cast.map((actor, idx) => (
                <div key={idx} className="bg-slate-800/60 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{actor.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{actor.role}</div>
                  </div>
                </div>
              ))}
            </div>
            {activeMovie.director && (
              <div className="text-xs text-slate-400 mt-2">
                निर्देशक: <span className="text-white font-semibold">{activeMovie.director}</span>
              </div>
            )}
          </div>

          {/* Footer CTAs */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              गिरिजा सिनेमा हल, जनकपुरधाम • नेपाल पे अनलाइन टिकटिङ
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setActiveMovie(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                बन्द गर्नुहोस्
              </button>

              {activeMovie.status === 'now-showing' && (
                <button
                  onClick={handleBook}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-rose-900/30 transition-all text-xs"
                >
                  <Ticket className="w-4 h-4" />
                  <span>शो समय र सिट छान्नुहोस्</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
