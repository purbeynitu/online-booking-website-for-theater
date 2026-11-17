import React, { useState } from 'react';
import { ShieldCheck, Plus, Trash2, Film, DollarSign, Ticket, Users, Search, Building2, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function AdminDashboard() {
  const {
    movies,
    addMovie,
    deleteMovie,
    bookings,
    theatres,
    isAdminAuthenticated,
    setIsAdminAuthenticated,
    setCurrentView
  } = useBooking();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'movies' | 'bookings' | 'legacy-migration'
  const [showAddModal, setShowAddModal] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // New movie form state
  const [newMovie, setNewMovie] = useState({
    title: '',
    language: 'English',
    genre: 'Action, Thriller',
    duration: '2h 15m',
    rating: 8.0,
    votes: '10K',
    ageRating: 'UA',
    formats: '2D, IMAX 2D',
    status: 'now-showing',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
    synopsis: '',
    director: ''
  });

  // Calculate metrics
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalTicketsSold = bookings.reduce((sum, b) => sum + (b.seats ? b.seats.length : 1), 0);

  const handleLogin = (e) => {
    e.preventDefault();
    // Default admin credentials matching legacy README: admincinema / --mnbvcxz-- or admin / admin123
    if ((adminUser === 'admincinema' && adminPass === '--mnbvcxz--') || (adminUser === 'admin' && adminPass === 'admin123')) {
      setIsAdminAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password. Try admin / admin123');
    }
  };

  const handleAddMovieSubmit = (e) => {
    e.preventDefault();
    if (!newMovie.title.trim()) return;

    const movieToAdd = {
      id: `mov-${Date.now()}`,
      title: newMovie.title,
      language: newMovie.language,
      genre: newMovie.genre.split(',').map(g => g.trim()),
      duration: newMovie.duration,
      rating: parseFloat(newMovie.rating) || 7.5,
      votes: newMovie.votes,
      ageRating: newMovie.ageRating,
      formats: newMovie.formats.split(',').map(f => f.trim()),
      status: newMovie.status,
      poster: newMovie.poster,
      banner: newMovie.banner,
      trailerUrl: newMovie.trailerUrl,
      synopsis: newMovie.synopsis,
      director: newMovie.director,
      cast: [{ name: 'Lead Actor', role: 'Main Character' }],
      releaseDate: new Date().toISOString().split('T')[0]
    };

    addMovie(movieToAdd);
    setShowAddModal(false);
    setNewMovie({
      title: '',
      language: 'English',
      genre: 'Action, Thriller',
      duration: '2h 15m',
      rating: 8.0,
      votes: '10K',
      ageRating: 'UA',
      formats: '2D, IMAX 2D',
      status: 'now-showing',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
      banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
      trailerUrl: '',
      synopsis: '',
      director: ''
    });
  };

  // If not logged in, show sleek login form
  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 animate-in fade-in duration-300">
        <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white">Admin Control Center</h2>
            <p className="text-xs text-slate-400">
              Sign in to manage movies, view live booking revenues, and configure theatre screens.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
              <input
                type="text"
                placeholder="admin"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                className="w-full bg-slate-950 text-sm text-white px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                placeholder="admin123"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="w-full bg-slate-950 text-sm text-white px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
              />
            </div>

            {loginError && <p className="text-xs text-rose-400">{loginError}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-xl transition-colors shadow-lg shadow-amber-500/20"
            >
              Sign In as Administrator
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAdminAuthenticated(true);
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors border border-slate-700"
            >
              One-Click Quick Demo Access
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={() => setCurrentView('home')}
              className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Website</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Master Management Portal</span>
          </div>
          <h2 className="text-3xl font-black text-white">Cinema Operations & Insights</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Movie</span>
          </button>

          <button
            onClick={() => setIsAdminAuthenticated(false)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">₹{totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-emerald-400 font-medium">↑ Real-time booking sales</div>
        </div>

        <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Tickets Sold</span>
            <Ticket className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-white">{totalTicketsSold}</div>
          <div className="text-xs text-slate-400 font-medium">Across all cinema screens</div>
        </div>

        <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Movies in Catalog</span>
            <Film className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{movies.length}</div>
          <div className="text-xs text-slate-400 font-medium">
            {movies.filter(m => m.status === 'now-showing').length} active now showing
          </div>
        </div>

        <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Theatres</span>
            <Building2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white">{theatres.length}</div>
          <div className="text-xs text-slate-400 font-medium">Multiplexes & IMAX partners</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Bookings Ledger ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('movies')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'movies'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Manage Movies ({movies.length})
        </button>

        <button
          onClick={() => setActiveTab('legacy-migration')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'legacy-migration'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Architecture & Schema
        </button>
      </div>

      {/* Tab: Bookings Ledger */}
      {activeTab === 'overview' && (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Customer Transactions
            </h3>
            <span className="text-xs text-slate-400">Real-time sync</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Movie & Format</th>
                  <th className="py-3 px-4">Theatre & Date</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {bookings.map((b) => (
                  <tr key={b.bookingId} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-400">
                      {b.bookingId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{b.customerName}</div>
                      <div className="text-[11px] text-slate-400">{b.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{b.movieTitle}</div>
                      <div className="text-[11px] text-slate-400">{b.format}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-300">{b.theatreName}</div>
                      <div className="text-[11px] text-slate-400">{b.date} • {b.time}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {b.seats?.join(', ') || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-400">
                      ₹{b.totalAmount}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/30">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Movies Management */}
      {activeTab === 'movies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {movies.map((m) => (
              <div
                key={m.id}
                className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 flex gap-4 items-start"
              >
                <img
                  src={m.poster}
                  alt={m.title}
                  className="w-16 h-24 object-cover rounded-xl border border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                    {m.status}
                  </span>
                  <h4 className="text-base font-bold text-white truncate">{m.title}</h4>
                  <p className="text-xs text-slate-400">{m.language} • {m.duration}</p>
                  <p className="text-xs text-slate-500 truncate mt-1">{m.genre.join(', ')}</p>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">★ {m.rating}</span>
                    <button
                      onClick={() => deleteMovie(m.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Legacy Architecture Mapping */}
      {activeTab === 'legacy-migration' && (
        <div className="bg-slate-900/60 p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-white">
            Modernized vs Legacy PHP Architecture
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            This modern application modernizes the original 2014 PHP/MySQL architecture found in <code className="text-rose-400">Online-Movie-Ticket-Booking-Script-Free-master</code>, replacing deprecated <code className="text-amber-400">mysql_connect()</code> calls with a reactive client-side store, seamless component hierarchy, and instant interactive seat picking.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-rose-400 font-bold uppercase tracking-wider">Legacy PHP 5.5 Script</span>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li><code className="text-slate-300">cinema_choodu.sql</code> MariaDB dump with 22 tables</li>
                <li><code className="text-slate-300">mysql_connect()</code> (removed in modern PHP 7+)</li>
                <li>Static PHP pages reload for every seat click (<code className="text-slate-300">seatsession.php</code>)</li>
                <li>Legacy PayUMoney form redirect</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold uppercase tracking-wider">Modern React + Vite Stack</span>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li>Instant dynamic 60fps SVG/CSS curved screen & seat map</li>
                <li>Persistent client store (LocalStorage + React Context)</li>
                <li>Mobile-first responsive Tailwind CSS theme</li>
                <li>Printable E-Tickets with QR codes & PDF generation</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Add Movie Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-700 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-white">Add New Movie</h3>

            <form onSubmit={handleAddMovieSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Movie Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Avatar: Fire and Ash"
                  value={newMovie.title}
                  onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                  className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Language</label>
                  <input
                    type="text"
                    value={newMovie.language}
                    onChange={(e) => setNewMovie({ ...newMovie, language: e.target.value })}
                    className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Duration</label>
                  <input
                    type="text"
                    value={newMovie.duration}
                    onChange={(e) => setNewMovie({ ...newMovie, duration: e.target.value })}
                    className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Genres (comma separated)</label>
                <input
                  type="text"
                  value={newMovie.genre}
                  onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                  className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Poster Image URL</label>
                <input
                  type="url"
                  value={newMovie.poster}
                  onChange={(e) => setNewMovie({ ...newMovie, poster: e.target.value })}
                  className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Synopsis</label>
                <textarea
                  rows={2}
                  placeholder="Brief story outline..."
                  value={newMovie.synopsis}
                  onChange={(e) => setNewMovie({ ...newMovie, synopsis: e.target.value })}
                  className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl"
                >
                  Add Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
