import express from 'express';
import { prisma } from '../db/prisma.js';

const router = express.Router();

// Fallback initial movies if Supabase DB is not yet populated
const FALLBACK_MOVIES = [
  {
    id: "mov-purna-bahadur",
    title: "Purna Bahadur Ko Sarangi",
    nepaliTitle: "पूर्ण बहादुरको सारङ्गी",
    genre: ["Emotional", "Drama", "Family"],
    language: "Nepali",
    formats: ["2D Digital", "Dolby 7.1"],
    rating: 9.3,
    votes: "88.5K",
    duration: "2h 20m",
    ageRating: "U",
    status: "NOW_SHOWING",
    posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=4rgYUipGJNo",
    synopsis: "The highest grossing film in Nepali cinema history. A heartbreaking story of an impoverished Gandharva father in rural Nepal.",
    director: "Saroj Paudel"
  },
  {
    id: "mov-12-gaun",
    title: "12 Gaun",
    nepaliTitle: "१२ गाउँ",
    genre: ["Action", "Thriller", "Revenge"],
    language: "Nepali",
    formats: ["2D Digital", "Dolby Atmos 7.1"],
    rating: 8.7,
    votes: "64.2K",
    duration: "2h 35m",
    ageRating: "A",
    status: "NOW_SHOWING",
    posterUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=600&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=1kVK0MZlbI4",
    synopsis: "An adrenaline-fueled, high-octane action thriller set across twelve village territories where a fearless young fighter rises.",
    director: "Biraj Bhatta"
  },
  {
    id: "mov-pushpa-2",
    title: "Pushpa 2: The Rule",
    nepaliTitle: "पुष्पा २: द रुल",
    genre: ["Action", "Crime", "Drama"],
    language: "Hindi (Nepali Subtitles)",
    formats: ["2D Digital", "Dolby Atmos"],
    rating: 8.9,
    votes: "110K",
    duration: "3h 05m",
    ageRating: "UA",
    status: "NOW_SHOWING",
    posterUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=1600&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=1kVK0MZlbI4",
    synopsis: "Pushpa Raj expands his syndicate while SP Bhanwar Singh Shekhawat vows retribution at Girija Cinema.",
    director: "Sukumar"
  }
];

function formatMovie(m) {
  if (!m) return m;
  const poster = m.posterUrl || m.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop';
  const banner = m.bannerUrl || m.banner || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop';
  const statusStr = (m.status || '').toLowerCase().replace(/_/g, '-');
  const normalizedStatus = statusStr === 'coming-soon' ? 'coming-soon' : 'now-showing';

  return {
    ...m,
    poster,
    posterUrl: poster,
    banner,
    bannerUrl: banner,
    status: normalizedStatus,
    rawStatus: m.status
  };
}

// GET /api/movies
router.get('/', async (req, res) => {
  try {
    if (prisma?.movie) {
      const movies = await prisma.movie.findMany({
        orderBy: { createdAt: 'desc' }
      });
      if (movies.length > 0) {
        return res.json({ success: true, data: movies.map(formatMovie) });
      }
    }
    return res.json({ success: true, data: FALLBACK_MOVIES.map(formatMovie) });
  } catch (error) {
    console.warn('Database query fallback:', error.message);
    res.json({ success: true, data: FALLBACK_MOVIES.map(formatMovie) });
  }
});

// GET /api/movies/:id
router.get('/:id', async (req, res) => {
  try {
    if (prisma?.movie) {
      const movie = await prisma.movie.findUnique({
        where: { id: req.params.id }
      });
      if (movie) return res.json({ success: true, data: formatMovie(movie) });
    }

    const fallback = FALLBACK_MOVIES.find(m => m.id === req.params.id);
    if (fallback) return res.json({ success: true, data: formatMovie(fallback) });

    return res.status(404).json({ success: false, message: 'Movie not found' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/movies (Admin)
router.post('/', async (req, res) => {
  try {
    const movieData = req.body;
    const isComingSoon = (movieData.status || '').toLowerCase().includes('soon');
    const prismaStatus = isComingSoon ? 'COMING_SOON' : 'NOW_SHOWING';

    const payload = {
      title: movieData.title,
      nepaliTitle: movieData.nepaliTitle || '',
      genre: Array.isArray(movieData.genre) ? movieData.genre : (movieData.genre ? movieData.genre.split(',').map(g => g.trim()) : ['Drama']),
      language: movieData.language || 'Nepali',
      formats: Array.isArray(movieData.formats) ? movieData.formats : (movieData.formats ? movieData.formats.split(',').map(f => f.trim()) : ['2D Digital']),
      duration: movieData.duration || '2h 15m',
      rating: parseFloat(movieData.rating) || 8.0,
      votes: String(movieData.votes || '10K'),
      ageRating: movieData.ageRating || 'UA',
      posterUrl: movieData.poster || movieData.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
      bannerUrl: movieData.banner || movieData.bannerUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
      trailerUrl: movieData.trailerUrl || '',
      synopsis: movieData.synopsis || 'Screening at Girija Cinema Hall Janakpur.',
      director: movieData.director || '',
      status: prismaStatus
    };

    if (prisma?.movie) {
      const created = await prisma.movie.create({
        data: payload
      });
      return res.status(201).json({ success: true, data: formatMovie(created) });
    }
    return res.status(201).json({ success: true, data: formatMovie({ ...payload, id: `mov-${Date.now()}` }) });
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/movies/:id (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (prisma?.movie) {
      await prisma.movie.delete({
        where: { id }
      });
      return res.json({ success: true, message: 'Movie deleted from database' });
    }
    return res.json({ success: true, message: 'Movie deleted (mock)' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
