import React from 'react';
import { Film, Filter, Search } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import MovieCard from './MovieCard';

export default function MovieGrid() {
  const {
    movies,
    searchQuery,
    selectedGenre,
    setSelectedGenre,
    selectedLanguage,
    setSelectedLanguage,
    movieTab,
    setMovieTab,
    hallInfo
  } = useBooking();

  // Extract all unique genres & languages
  const allGenres = ['All', ...Array.from(new Set(movies.flatMap(m => m.genre)))];
  const allLanguages = ['All', ...Array.from(new Set(movies.map(m => m.language)))];

  // Filtering
  const filteredMovies = movies.filter(movie => {
    if (movieTab !== 'all' && movie.status !== movieTab) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = movie.title.toLowerCase().includes(q);
      const matchesNepaliTitle = movie.nepaliTitle?.toLowerCase().includes(q);
      const matchesGenre = movie.genre.some(g => g.toLowerCase().includes(q));
      const matchesLanguage = movie.language.toLowerCase().includes(q);
      if (!matchesTitle && !matchesNepaliTitle && !matchesGenre && !matchesLanguage) {
        return false;
      }
    }

    if (selectedGenre !== 'All' && !movie.genre.includes(selectedGenre)) {
      return false;
    }

    if (selectedLanguage !== 'All' && movie.language !== selectedLanguage) {
      return false;
    }

    return true;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">
            <Film className="w-4 h-4" />
            <span>गिरिजा सिनेमा हल, जनकपुरधाम • चलचित्र तालिका</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            प्रदर्शनमा रहेका चलचित्रहरू (Movies on Screen)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audi 1 (Dolby Atmos 7.1) र Audi 2 (Qube Digital 2K) मा चलिरहेका नेपाली, मैथिली, भोजपुरी तथा बलिउड चलचित्रहरू
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setMovieTab('now-showing')}
            className={`px-5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
              movieTab === 'now-showing'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            हाल प्रदर्शनमा ({movies.filter(m => m.status === 'now-showing').length})
          </button>
          
          <button
            onClick={() => setMovieTab('coming-soon')}
            className={`px-5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
              movieTab === 'coming-soon'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            चाँडै आउँदैछ ({movies.filter(m => m.status === 'coming-soon').length})
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="py-6 flex flex-wrap items-center justify-between gap-4">
        
        {/* Genre Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            विधा (Genre):
          </span>
          {allGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                selectedGenre === genre
                  ? 'bg-rose-600/20 border-rose-500 text-rose-300 shadow-sm'
                  : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            भाषा:
          </span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            aria-label="Filter by Language"
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            {allLanguages.map((lang) => (
              <option key={lang} value={lang} className="bg-slate-900 text-slate-200">
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800/80 px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">कुनै चलचित्र फेला परेन</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            तपाईंले खोज्नुभएको फिल्टर वा नाममा कुनै चलचित्र फेला परेन। कृपया फिल्टर रिसेट गर्नुहोस्।
          </p>
          <button
            onClick={() => {
              setSelectedGenre('All');
              setSelectedLanguage('All');
            }}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            सबै फिल्टरहरू रिसेट गर्नुहोस्
          </button>
        </div>
      )}
    </section>
  );
}
