import React, { useState } from 'react';
import { Film, MapPin, Search, Ticket, ShieldCheck, Menu, X, Phone, QrCode } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function Navbar() {
  const {
    hallInfo,
    searchQuery,
    setSearchQuery,
    currentView,
    setCurrentView,
    bookings,
    backendStatus
  } = useBooking();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      {/* Top Notification Bar for Janakpur Cinema */}
      <div className="bg-gradient-to-r from-red-950 via-rose-900 to-red-950 text-[11px] text-slate-200 py-1.5 px-4 border-b border-rose-800/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-300">📍 जनकपुरधाम:</span>
            <span>स्टेशन रोड (रामानन्द चोक नजिकै), जनकपुरधाम, धनुषा, नेपाल</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-medium text-[10px] text-slate-300">
                {backendStatus === 'connected' ? 'Supabase Backend Connected' : 'Local Standalone Mode'}
              </span>
            </div>
            <a href="tel:+97741520123" className="hidden sm:flex items-center gap-1 hover:text-white transition-colors">
              <Phone className="w-3 h-3 text-amber-400" />
              <span>सम्पर्क: ०४१-५२०१२३</span>
            </a>
            <div className="hidden sm:flex items-center gap-1 text-emerald-300 font-semibold">
              <QrCode className="w-3 h-3" />
              <span>NepalPay QR</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            onClick={() => handleNav('home')} 
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-700 via-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-900/40 group-hover:scale-105 transition-transform">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Girija<span className="text-rose-500">Cinema</span>
                </span>
                <span className="text-xs font-bold text-amber-400 font-serif">जनकपुर</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider">
                गिरिजा सिनेमा हल • अनलाइन टिकट बुकिङ
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="चलचित्र वा शो खोज्नुहोस् (Search movies, times)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 text-xs sm:text-sm text-slate-200 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-3">
            <button
              onClick={() => handleNav('home')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                currentView === 'home'
                  ? 'text-white bg-slate-800 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              चलचित्रहरू (Movies)
            </button>

            <button
              onClick={() => handleNav('find-ticket')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                currentView === 'find-ticket'
                  ? 'text-white bg-slate-800 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Ticket className="w-4 h-4 text-rose-400" />
              <span>टिकट खोज्नुहोस् (Find Ticket)</span>
              {bookings.length > 0 && (
                <span className="ml-1 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {bookings.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNav('admin')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                currentView === 'admin'
                  ? 'border-amber-500/80 bg-amber-500/10 text-amber-400'
                  : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-amber-400 hover:border-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>हल व्यवस्थापक (Admin)</span>
            </button>
          </nav>

          {/* Mobile menu toggle */}
          <div className="flex lg:hidden items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="चलचित्र खोज्नुहोस्..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 text-sm text-slate-200 placeholder-slate-400 pl-10 pr-4 py-2 rounded-lg border border-slate-700"
              />
            </div>

            <div className="flex flex-col space-y-2 pt-2">
              <button
                onClick={() => handleNav('home')}
                className="text-left px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-900"
              >
                चलचित्रहरू (Movies Now Showing)
              </button>
              <button
                onClick={() => handleNav('find-ticket')}
                className="text-left px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-900 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-rose-400" />
                  टिकट खोज्नुहोस् (Find Ticket)
                </span>
                {bookings.length > 0 && (
                  <span className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {bookings.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleNav('admin')}
                className="text-left px-3 py-2 rounded-md text-sm font-medium text-amber-400 hover:bg-slate-900 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                हल व्यवस्थापक (Admin Portal)
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
