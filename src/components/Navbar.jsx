import React, { useState } from 'react';
import { Film, MapPin, Search, Ticket, ShieldCheck, Menu, X, Clapperboard } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function Navbar() {
  const {
    cities,
    selectedCity,
    setSelectedCity,
    searchQuery,
    setSearchQuery,
    currentView,
    setCurrentView,
    bookings
  } = useBooking();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeCityName = cities.find(c => c.id === selectedCity)?.name || 'Select City';

  const handleNav = (view) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            onClick={() => handleNav('home')} 
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform">
              <Clapperboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                Cine<span className="text-rose-500">Pass</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Online Theatre Booking</p>
            </div>
          </div>

          {/* Search & Location Bar */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-lg mx-8">
            {/* Search Input */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search movies, theatres, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 text-sm text-slate-200 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
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

            {/* City Dropdown */}
            <div className="relative group">
              <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-700/60 px-3.5 py-2.5 rounded-xl cursor-pointer hover:border-slate-600 transition-colors">
                <MapPin className="w-4 h-4 text-rose-500" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  aria-label="Select City"
                  className="bg-transparent text-sm font-medium text-slate-200 focus:outline-none cursor-pointer pr-2"
                >
                  {cities.map((city) => (
                    <option key={city.id} value={city.id} className="bg-slate-900 text-slate-200">
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-3">
            <button
              onClick={() => handleNav('home')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'home'
                  ? 'text-white bg-slate-800/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              Movies
            </button>

            <button
              onClick={() => handleNav('find-ticket')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'find-ticket'
                  ? 'text-white bg-slate-800/80 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Ticket className="w-4 h-4 text-rose-400" />
              <span>Find Ticket</span>
              {bookings.length > 0 && (
                <span className="ml-1 bg-rose-600 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                  {bookings.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNav('admin')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                currentView === 'admin'
                  ? 'border-amber-500/80 bg-amber-500/10 text-amber-400'
                  : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-amber-400 hover:border-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </button>
          </nav>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 text-sm text-slate-200 placeholder-slate-400 pl-10 pr-4 py-2 rounded-lg border border-slate-700"
              />
            </div>

            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg">
              <MapPin className="w-4 h-4 text-rose-500" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                aria-label="Select City (Mobile)"
                className="bg-transparent text-sm text-slate-200 focus:outline-none w-full"
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.id} className="bg-slate-900 text-slate-200">
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col space-y-2 pt-2">
              <button
                onClick={() => handleNav('home')}
                className="text-left px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-900"
              >
                Movies
              </button>
              <button
                onClick={() => handleNav('find-ticket')}
                className="text-left px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-900 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-rose-400" />
                  Find / Print Ticket
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
                Admin Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
