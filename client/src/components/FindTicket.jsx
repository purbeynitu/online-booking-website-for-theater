import React, { useState, useEffect } from 'react';
import { Search, Ticket, Calendar, Clock, MapPin, Printer, Database, Loader2 } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { apiLookupBookings } from '../services/api';

function normalizeTicket(b) {
  return {
    bookingId: b.bookingRef || b.bookingId,
    createdAt: b.createdAt,
    movieId: b.show?.movie?.id || b.movieId || 'mov-purna-bahadur',
    movieTitle: b.show?.movie?.title || b.movieTitle || 'Girija Movie',
    nepaliTitle: b.show?.movie?.nepaliTitle || b.nepaliTitle || '',
    moviePoster: b.show?.movie?.posterUrl || b.moviePoster || b.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
    theatreName: "Girija Cinema Hall",
    nepaliTheatreName: "गिरिजा सिनेमा हल",
    address: "Station Road, Janakpurdham, Dhanusha, Nepal",
    phone: "+977 41-520123 / +977 9801234567",
    screen: b.show?.screen?.name || b.screen || "Audi 1: Main Hall (Dolby Atmos 7.1)",
    format: b.show?.movie?.formats?.[0] || b.format || "2D Digital",
    date: b.show?.date || b.date || new Date().toISOString().split('T')[0],
    time: b.show?.startTime || b.time || "02:30 PM",
    seats: b.seats || [],
    seatDetails: b.seatDetails || (b.seats || []).map(id => ({ id, row: id[0], number: id.slice(1), category: 'Ticket', price: Math.round((b.totalAmount || 300) / (b.seats?.length || 1)) })),
    snacks: b.snacks || [],
    customerName: b.customerName,
    customerEmail: b.customerEmail,
    customerPhone: b.customerPhone,
    seatSubtotal: b.seatSubtotal || b.totalAmount || 0,
    snacksTotal: b.snacksTotal || 0,
    serviceCharge: b.serviceCharge || 20,
    discount: b.discountAmount || 0,
    totalAmount: b.totalAmount || 0,
    currency: "रू (NPR)",
    gateway: b.paymentGateway || b.gateway || 'NEPALPAY_QR',
    nepalPayTxId: b.nepalPayTxId,
    paymentRef: b.paymentRef,
    status: b.paymentStatus || b.status || 'CONFIRMED',
    isDatabaseRecord: !!b.id
  };
}

export default function FindTicket() {
  const { bookings, setCompletedTicket, setCurrentView, hallInfo, backendStatus } = useBooking();
  const [searchTerm, setSearchTerm] = useState('');
  const [dbResults, setDbResults] = useState([]);
  const [isSearchingDb, setIsSearchingDb] = useState(false);

  // Search Supabase database when user enters search term
  useEffect(() => {
    let isCurrent = true;
    const lookup = async () => {
      if (!searchTerm.trim()) {
        setDbResults([]);
        return;
      }
      setIsSearchingDb(true);
      try {
        const res = await apiLookupBookings(searchTerm.trim());
        if (isCurrent && res && res.success && Array.isArray(res.data)) {
          setDbResults(res.data.map(normalizeTicket));
        }
      } catch (err) {
        console.warn('Backend ticket search note:', err.message);
      } finally {
        if (isCurrent) setIsSearchingDb(false);
      }
    };

    const timer = setTimeout(lookup, 350);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Combine local bookings with backend database results (deduplicating by bookingId)
  const allAvailableTickets = React.useMemo(() => {
    const map = new Map();
    // 1. Add local tickets
    bookings.forEach(b => {
      if (b.bookingId) map.set(b.bookingId, b);
    });
    // 2. Add backend database tickets
    dbResults.forEach(b => {
      if (b.bookingId) map.set(b.bookingId, b);
    });
    return Array.from(map.values());
  }, [bookings, dbResults]);

  const filteredBookings = allAvailableTickets.filter((b) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (b.bookingId && b.bookingId.toLowerCase().includes(term)) ||
      (b.customerPhone && b.customerPhone.includes(term)) ||
      (b.customerEmail && b.customerEmail.toLowerCase().includes(term)) ||
      (b.movieTitle && b.movieTitle.toLowerCase().includes(term)) ||
      (b.customerName && b.customerName.toLowerCase().includes(term))
    );
  });

  const handleViewTicket = (ticket) => {
    setCompletedTicket(ticket);
    setCurrentView('ticket-success');
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/20 text-rose-400 text-xs font-bold uppercase tracking-wider">
          <Ticket className="w-3.5 h-3.5" />
          <span>गिरिजा सिनेमा हल • टिकट खोज्नुहोस्</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">टिकट खोज्नुहोस् र पुनः प्रिन्ट गर्नुहोस्</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          तपाईंको बुकिङ आइडी (उदा: GJ-892104) वा १० अङ्कको मोबाइल नम्बर हानेर टिकट हेर्नुहोस् र प्रिन्ट गर्नुहोस्।
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-lg mx-auto relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="बुकिङ आइडी वा मोबाइल नम्बर हाल्नुहोस्..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 text-sm text-white placeholder-slate-500 pl-12 pr-4 py-3.5 rounded-2xl border border-slate-700 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all shadow-lg"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>{filteredBookings.length} वटा बुकिङ फेला पर्यो</span>
          <span>हल: {hallInfo.name}, जनकपुरधाम</span>
        </div>

        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((ticket) => (
              <div
                key={ticket.bookingId}
                className="bg-slate-900/70 p-5 sm:p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                    <img
                      src={ticket.moviePoster}
                      alt={ticket.movieTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-400">
                        {ticket.bookingId}
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                        {ticket.status}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        NepalPay
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-white mt-1">
                      {ticket.movieTitle}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {ticket.theatreName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {ticket.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {ticket.time}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 mt-2">
                      सिटहरू: <strong className="text-white">{ticket.seats.join(', ')}</strong> | तिरेको रकम: <strong className="text-emerald-400">रू {ticket.totalAmount}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <button
                    onClick={() => handleViewTicket(ticket)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-900/40"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>टिकट हेर्नुहोस् र प्रिन्ट</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 p-6 space-y-3">
            <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white">कुनै टिकट फेला परेन</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              कृपया आफ्नो बुकिङ आइडी वा मोबाइल नम्बर जाँच गर्नुहोस् वा नयाँ टिकट बुक गर्नुहोस्।
            </p>
            <button
              onClick={() => setCurrentView('home')}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              चलचित्र हेर्नुहोस् (Browse Movies)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
