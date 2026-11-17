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

// GET /api/movies
router.get('/', async (req, res) => {
  try {
    if (prisma?.movie) {
      const movies = await prisma.movie.findMany({
        orderBy: { createdAt: 'desc' }
      });
      if (movies.length > 0) {
        return res.json({ success: true, data: movies });
      }
    }
    return res.json({ success: true, data: FALLBACK_MOVIES });
  } catch (error) {
    console.warn('Database query fallback:', error.message);
    res.json({ success: true, data: FALLBACK_MOVIES });
  }
});

// GET /api/movies/:id
router.get('/:id', async (req, res) => {
  try {
    if (prisma?.movie) {
      const movie = await prisma.movie.findUnique({
        where: { id: req.params.id }
      });
      if (movie) return res.json({ success: true, data: movie });
    }

    const fallback = FALLBACK_MOVIES.find(m => m.id === req.params.id);
    if (fallback) return res.json({ success: true, data: fallback });

    return res.status(404).json({ success: false, message: 'Movie not found' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/movies (Admin)
router.post('/', async (req, res) => {
  try {
    const movieData = req.body;
    if (prisma?.movie) {
      const created = await prisma.movie.create({
        data: movieData
      });
      return res.status(201).json({ success: true, data: created });
    }
    return res.status(201).json({ success: true, data: { ...movieData, id: `mov-${Date.now()}` } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
