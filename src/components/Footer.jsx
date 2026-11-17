import React from 'react';
import { Film, ShieldCheck, MapPin, Phone, QrCode } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function Footer() {
  const { setCurrentView, hallInfo } = useBooking();

  return (
    <footer className="no-print mt-20 bg-slate-950 border-t border-slate-900 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Hall Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-700 to-amber-500 flex items-center justify-center text-white">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-white">
                Girija<span className="text-rose-500">Cinema</span>
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              गिरिजा सिनेमा हल (Girija Talkies) — जनकपुरधामको ऐतिहासिक र अत्याधुनिक २K डिजिटल डल्बी सराउण्ड सिनेमा हल। नेपाल पे (NepalPay) मार्फत सुरक्षित अनलाइन टिकट बुकिङ।
            </p>
          </div>

          {/* Location & Contact */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">सम्पर्क र ठेगाना</h4>
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>{hallInfo.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{hallInfo.phone}</span>
              </div>
              <p className="text-[10px] text-slate-500 pt-1">
                शो समयहरू: बिहानी ११:३० | दिउँसो २:३० | साँझ ५:४५ | रात्री ८:४५
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">द्रुत लिङ्कहरू (Links)</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => setCurrentView('home')} className="hover:text-rose-400 transition-colors">
                  हाल प्रदर्शनमा रहेका चलचित्रहरू (Now Showing)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('find-ticket')} className="hover:text-rose-400 transition-colors">
                  टिकट खोज्नुहोस् र प्रिन्ट गर्नुहोस् (Print Ticket)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('admin')} className="hover:text-amber-400 transition-colors">
                  हल व्यवस्थापक लगइन (Manager Portal)
                </button>
              </li>
            </ul>
          </div>

          {/* NepalPay Payment Badges */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">नेपाल पे सुरक्षित भुक्तानी</h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>NCHL NepalPay Verified Gateway</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['NepalPay QR', 'eSewa', 'Khalti', 'connectIPS', 'Fonepay'].map(p => (
                  <span key={p} className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                    {p}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 pt-1">
                नेपालका ५०+ वाणिज्य तथा विकास बैंकहरूको मोबाइल बैंकिङबाट भुक्तानी सम्भव छ।
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} गिरिजा सिनेमा हल, जनकपुरधाम (Girija Cinema Hall). सर्वाधिकार सुरक्षित।
          </div>
          <div className="flex items-center gap-1">
            Integrated with Nepal-Pay Open Gateway
          </div>
        </div>
      </div>
    </footer>
  );
}
