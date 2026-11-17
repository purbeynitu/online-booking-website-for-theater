import React from 'react';
import { Clapperboard, Heart, ShieldCheck, Ticket, MapPin } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function Footer() {
  const { setCurrentView } = useBooking();

  return (
    <footer className="no-print mt-20 bg-slate-950 border-t border-slate-900 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white">
                <Clapperboard className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-white">
                Cine<span className="text-rose-500">Pass</span>
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Experience movie magic with seamless online ticket booking, interactive tiered seat selection, gourmet cinema snacks, and instant QR e-tickets.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cinemas & Shows</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => setCurrentView('home')} className="hover:text-rose-400 transition-colors">
                  Now Showing Movies
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('home')} className="hover:text-rose-400 transition-colors">
                  Upcoming Blockbusters
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('find-ticket')} className="hover:text-rose-400 transition-colors">
                  Print & Download Tickets
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('admin')} className="hover:text-amber-400 transition-colors">
                  Theatre Partner Login
                </button>
              </li>
            </ul>
          </div>

          {/* Formats Supported */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Supported Formats</h4>
            <div className="flex flex-wrap gap-1.5">
              {['IMAX Laser', 'Dolby Atmos', '4DX Motion', 'RealD 3D', 'VIP Recliner', '70mm Film'].map(f => (
                <span key={f} className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Security & Support */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Secure Booking</h4>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>256-bit SSL Encrypted Checkout</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Inspired by and modernizing the free open-source Online Movie Ticket Booking Script.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} CinePass. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            Built with React, Tailwind CSS & Vite
          </div>
        </div>
      </div>
    </footer>
  );
}
