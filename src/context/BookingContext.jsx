import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_MOVIES, CITIES, THEATRES, SEAT_CATEGORIES, SNACKS, COUPONS, SAMPLE_BOOKINGS } from '../data/mockData';

const BookingContext = createContext();

export function BookingProvider({ children }) {
  // Cities & active city
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('cp_selected_city') || 'hyd';
  });

  // Movies list (persisted in localStorage for Admin updates)
  const [movies, setMovies] = useState(() => {
    const saved = localStorage.getItem('cp_movies');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return INITIAL_MOVIES;
  });

  // Bookings list (persisted in localStorage)
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('cp_bookings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return SAMPLE_BOOKINGS;
  });

  // Active view: 'home' | 'movie-detail' | 'booking-flow' | 'ticket-success' | 'find-ticket' | 'admin'
  const [currentView, setCurrentView] = useState('home');

  // Currently inspected movie for detail modal
  const [activeMovie, setActiveMovie] = useState(null);

  // Active booking wizard state
  const [bookingDetails, setBookingDetails] = useState({
    movie: null,
    theatre: null,
    date: new Date().toISOString().split('T')[0],
    showtime: '',
    format: 'IMAX 2D',
    screen: 'Screen 1 (Laser)',
    seats: [], // Array of seat objects { id, row, number, category, price }
    snacks: [], // Array of { id, name, price, quantity }
    coupon: null,
    discountAmount: 0,
    customer: {
      name: '',
      email: '',
      phone: ''
    }
  });

  // Current completed ticket for display/print
  const [completedTicket, setCompletedTicket] = useState(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [movieTab, setMovieTab] = useState('now-showing'); // 'now-showing' | 'coming-soon'

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('cp_admin_auth') === 'true';
  });

  // Save movies & bookings to localStorage
  useEffect(() => {
    localStorage.setItem('cp_movies', JSON.stringify(movies));
  }, [movies]);

  useEffect(() => {
    localStorage.setItem('cp_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('cp_selected_city', selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    localStorage.setItem('cp_admin_auth', isAdminAuthenticated ? 'true' : 'false');
  }, [isAdminAuthenticated]);

  // Pricing calculations
  const calculateSeatSubtotal = () => {
    return bookingDetails.seats.reduce((sum, s) => sum + s.price, 0);
  };

  const calculateSnacksTotal = () => {
    return bookingDetails.snacks.reduce((sum, s) => sum + (s.price * s.quantity), 0);
  };

  const calculateConvenienceFee = () => {
    const seatCount = bookingDetails.seats.length;
    if (seatCount === 0) return 0;
    // Rs 35 per ticket convenience fee + GST
    return Math.round(seatCount * 35.40);
  };

  const calculateGrandTotal = () => {
    const seatSubtotal = calculateSeatSubtotal();
    const snacksTotal = calculateSnacksTotal();
    const convFee = calculateConvenienceFee();
    const discount = bookingDetails.discountAmount || 0;
    const total = (seatSubtotal + snacksTotal + convFee) - discount;
    return Math.max(0, Math.round(total));
  };

  // Start booking a movie
  const startBooking = (movie, preferredTheatre = null, preferredTime = null) => {
    const cityTheatres = THEATRES.filter(t => t.cityId === selectedCity);
    const defaultTheatre = preferredTheatre || cityTheatres[0] || THEATRES[0];
    const defaultTime = preferredTime || (defaultTheatre?.showtimes?.[0] || '01:30 PM');

    setBookingDetails({
      movie: movie,
      theatre: defaultTheatre,
      date: new Date().toISOString().split('T')[0],
      showtime: defaultTime,
      format: movie.formats[0] || '2D',
      screen: defaultTheatre.screens[0] || 'Screen 1',
      seats: [],
      snacks: [],
      coupon: null,
      discountAmount: 0,
      customer: {
        name: '',
        email: '',
        phone: ''
      }
    });
    setCurrentView('booking-flow');
  };

  // Seat toggle logic
  const toggleSeat = (seat) => {
    setBookingDetails(prev => {
      const exists = prev.seats.some(s => s.id === seat.id);
      if (exists) {
        return {
          ...prev,
          seats: prev.seats.filter(s => s.id !== seat.id)
        };
      } else {
        if (prev.seats.length >= 8) {
          alert('You can select a maximum of 8 seats per booking.');
          return prev;
        }
        return {
          ...prev,
          seats: [...prev.seats, seat]
        };
      }
    });
  };

  // Snacks quantity update
  const updateSnackQuantity = (snack, change) => {
    setBookingDetails(prev => {
      const existing = prev.snacks.find(s => s.id === snack.id);
      let updatedSnacks;

      if (!existing) {
        if (change > 0) {
          updatedSnacks = [...prev.snacks, { ...snack, quantity: 1 }];
        } else {
          return prev;
        }
      } else {
        const newQty = existing.quantity + change;
        if (newQty <= 0) {
          updatedSnacks = prev.snacks.filter(s => s.id !== snack.id);
        } else {
          updatedSnacks = prev.snacks.map(s => s.id === snack.id ? { ...s, quantity: newQty } : s);
        }
      }

      return {
        ...prev,
        snacks: updatedSnacks
      };
    });
  };

  // Apply discount coupon
  const applyCoupon = (couponCode) => {
    const code = couponCode.trim().toUpperCase();
    const matched = COUPONS.find(c => c.code === code);
    if (!matched) {
      return { success: false, message: 'Invalid promo code. Try CINEPASS50' };
    }

    const subtotal = calculateSeatSubtotal() + calculateSnacksTotal();
    if (subtotal < matched.minAmount) {
      return { success: false, message: `Minimum order amount for this coupon is ₹${matched.minAmount}` };
    }

    let discount = Math.round((subtotal * matched.discountPercent) / 100);
    if (discount > matched.maxDiscount) {
      discount = matched.maxDiscount;
    }

    setBookingDetails(prev => ({
      ...prev,
      coupon: matched,
      discountAmount: discount
    }));

    return { success: true, message: `Coupon ${matched.code} applied! Saved ₹${discount}` };
  };

  const removeCoupon = () => {
    setBookingDetails(prev => ({
      ...prev,
      coupon: null,
      discountAmount: 0
    }));
  };

  // Complete booking and generate ticket
  const finalizeBooking = (customerInfo, paymentMethod) => {
    const bookingId = `CP-${Math.floor(100000 + Math.random() * 900000)}`;
    const grandTotal = calculateGrandTotal();

    const newTicket = {
      bookingId,
      createdAt: new Date().toISOString(),
      movieId: bookingDetails.movie.id,
      movieTitle: bookingDetails.movie.title,
      moviePoster: bookingDetails.movie.poster,
      theatreName: bookingDetails.theatre.name,
      city: CITIES.find(c => c.id === selectedCity)?.name || 'Hyderabad',
      location: bookingDetails.theatre.location,
      screen: bookingDetails.screen,
      format: bookingDetails.format,
      date: bookingDetails.date,
      time: bookingDetails.showtime,
      seats: bookingDetails.seats.map(s => s.id),
      seatDetails: bookingDetails.seats,
      snacks: bookingDetails.snacks,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      seatSubtotal: calculateSeatSubtotal(),
      snacksTotal: calculateSnacksTotal(),
      convenienceFee: calculateConvenienceFee(),
      discount: bookingDetails.discountAmount,
      totalAmount: grandTotal,
      paymentMethod,
      status: 'CONFIRMED'
    };

    setBookings(prev => [newTicket, ...prev]);
    setCompletedTicket(newTicket);
    setCurrentView('ticket-success');
    return newTicket;
  };

  // Admin actions: Add / Remove movie
  const addMovie = (newMovie) => {
    setMovies(prev => [newMovie, ...prev]);
  };

  const deleteMovie = (id) => {
    setMovies(prev => prev.filter(m => m.id !== id));
  };

  const updateMovie = (updatedMovie) => {
    setMovies(prev => prev.map(m => m.id === updatedMovie.id ? updatedMovie : m));
  };

  return (
    <BookingContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        cities: CITIES,
        movies,
        theatres: THEATRES,
        snacksList: SNACKS,
        coupons: COUPONS,
        bookings,
        currentView,
        setCurrentView,
        activeMovie,
        setActiveMovie,
        bookingDetails,
        setBookingDetails,
        completedTicket,
        setCompletedTicket,
        searchQuery,
        setSearchQuery,
        selectedGenre,
        setSelectedGenre,
        selectedLanguage,
        setSelectedLanguage,
        movieTab,
        setMovieTab,
        isAdminAuthenticated,
        setIsAdminAuthenticated,
        startBooking,
        toggleSeat,
        updateSnackQuantity,
        applyCoupon,
        removeCoupon,
        finalizeBooking,
        addMovie,
        deleteMovie,
        updateMovie,
        calculateSeatSubtotal,
        calculateSnacksTotal,
        calculateConvenienceFee,
        calculateGrandTotal
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
