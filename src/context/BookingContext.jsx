import React, { createContext, useContext, useState, useEffect } from 'react';
import { GIRIJA_HALL_INFO, INITIAL_MOVIES, SEAT_CATEGORIES, GIRIJA_CANTEEN_SNACKS, GIRIJA_COUPONS, SAMPLE_BOOKINGS } from '../data/mockData';
import { generateNepalPayQr, processNepalPayPayment } from '../services/nepalPayService';

const BookingContext = createContext();

export function BookingProvider({ children }) {
  // Hall details
  const hallInfo = GIRIJA_HALL_INFO;

  // Movies list (persisted in localStorage)
  const [movies, setMovies] = useState(() => {
    const saved = localStorage.getItem('girija_movies');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return INITIAL_MOVIES;
  });

  // Bookings list (persisted in localStorage)
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('girija_bookings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return SAMPLE_BOOKINGS;
  });

  // Current view: 'home' | 'booking-flow' | 'ticket-success' | 'find-ticket' | 'admin'
  const [currentView, setCurrentView] = useState('home');

  // Currently inspected movie for modal
  const [activeMovie, setActiveMovie] = useState(null);

  // Active booking wizard details
  const [bookingDetails, setBookingDetails] = useState({
    movie: null,
    theatre: hallInfo,
    date: new Date().toISOString().split('T')[0],
    showtime: '02:30 PM',
    format: '2D Digital',
    screen: hallInfo.screens[0].name,
    seats: [], // Array of seat objects { id, row, number, category, price }
    snacks: [], // Array of { id, name, price, quantity }
    coupon: null,
    discountAmount: 0,
    customer: {
      name: '',
      email: '',
      phone: ''
    },
    nepalPayInfo: null
  });

  // Completed Ticket
  const [completedTicket, setCompletedTicket] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [movieTab, setMovieTab] = useState('now-showing');

  // Admin authentication
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('girija_admin_auth') === 'true';
  });

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem('girija_movies', JSON.stringify(movies));
  }, [movies]);

  useEffect(() => {
    localStorage.setItem('girija_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('girija_admin_auth', isAdminAuthenticated ? 'true' : 'false');
  }, [isAdminAuthenticated]);

  // Calculations in NPR
  const calculateSeatSubtotal = () => {
    return bookingDetails.seats.reduce((sum, s) => sum + s.price, 0);
  };

  const calculateSnacksTotal = () => {
    return bookingDetails.snacks.reduce((sum, s) => sum + (s.price * s.quantity), 0);
  };

  const calculateServiceCharge = () => {
    const seatCount = bookingDetails.seats.length;
    if (seatCount === 0) return 0;
    // रू 20 local cinema service & municipal ticket fee
    return seatCount * 20;
  };

  const calculateGrandTotal = () => {
    const seatSubtotal = calculateSeatSubtotal();
    const snacksTotal = calculateSnacksTotal();
    const fee = calculateServiceCharge();
    const discount = bookingDetails.discountAmount || 0;
    const total = (seatSubtotal + snacksTotal + fee) - discount;
    return Math.max(0, Math.round(total));
  };

  // Start booking
  const startBooking = (movie, preferredTime = null, preferredScreen = null) => {
    const defaultTime = preferredTime || hallInfo.showtimes[1] || '02:30 PM';
    const defaultScreen = preferredScreen || hallInfo.screens[0].name;

    setBookingDetails({
      movie,
      theatre: hallInfo,
      date: new Date().toISOString().split('T')[0],
      showtime: defaultTime,
      format: movie.formats[0] || '2D Digital',
      screen: defaultScreen,
      seats: [],
      snacks: [],
      coupon: null,
      discountAmount: 0,
      customer: {
        name: '',
        email: '',
        phone: ''
      },
      nepalPayInfo: null
    });
    setCurrentView('booking-flow');
  };

  // Toggle seat selection
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
          alert('अधिकतम ८ वटा टिकट मात्र छान्न सकिन्छ (Maximum 8 seats per booking).');
          return prev;
        }
        return {
          ...prev,
          seats: [...prev.seats, seat]
        };
      }
    });
  };

  // Update snack quantity
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

  // Apply Nepali coupon
  const applyCoupon = (code) => {
    const trimmed = code.trim().toUpperCase();
    const matched = GIRIJA_COUPONS.find(c => c.code === trimmed);
    if (!matched) {
      return { success: false, message: 'अमान्य कुपन कोड (Invalid promo code. Try GIRIJA50 or JANAKPUR20)' };
    }

    const subtotal = calculateSeatSubtotal() + calculateSnacksTotal();
    if (subtotal < matched.minAmount) {
      return { success: false, message: `न्यूनतम रू ${matched.minAmount} को अर्डर हुनुपर्छ (Minimum order रू ${matched.minAmount})` };
    }

    let discount = 0;
    if (matched.discountAmount) {
      discount = matched.discountAmount;
    } else if (matched.discountPercent) {
      discount = Math.round((subtotal * matched.discountPercent) / 100);
      if (matched.maxDiscount && discount > matched.maxDiscount) {
        discount = matched.maxDiscount;
      }
    }

    setBookingDetails(prev => ({
      ...prev,
      coupon: matched,
      discountAmount: discount
    }));

    return { success: true, message: `कुपन ${matched.code} सफल भयो! रू ${discount} छुट पाइयो!` };
  };

  const removeCoupon = () => {
    setBookingDetails(prev => ({
      ...prev,
      coupon: null,
      discountAmount: 0
    }));
  };

  // Finalize booking via NepalPay
  const finalizeBookingWithNepalPay = async (customerInfo, gatewayChoice) => {
    const bookingId = `GJ-${Math.floor(100000 + Math.random() * 900000)}`;
    const grandTotal = calculateGrandTotal();

    // Call NepalPay service
    const paymentResult = await processNepalPayPayment({
      gateway: gatewayChoice,
      amount: grandTotal,
      bookingId,
      customer: customerInfo
    });

    const newTicket = {
      bookingId,
      createdAt: new Date().toISOString(),
      movieId: bookingDetails.movie.id,
      movieTitle: bookingDetails.movie.title,
      nepaliTitle: bookingDetails.movie.nepaliTitle,
      moviePoster: bookingDetails.movie.poster,
      theatreName: hallInfo.name,
      nepaliTheatreName: hallInfo.nepaliName,
      address: hallInfo.address,
      phone: hallInfo.phone,
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
      serviceCharge: calculateServiceCharge(),
      discount: bookingDetails.discountAmount,
      totalAmount: grandTotal,
      currency: "रू (NPR)",
      gateway: gatewayChoice,
      nepalPayTxId: paymentResult.transactionId,
      paymentRef: paymentResult.paymentRef,
      status: 'CONFIRMED'
    };

    setBookings(prev => [newTicket, ...prev]);
    setCompletedTicket(newTicket);
    setCurrentView('ticket-success');
    return newTicket;
  };

  // Admin controls
  const addMovie = (movie) => {
    setMovies(prev => [movie, ...prev]);
  };

  const deleteMovie = (id) => {
    setMovies(prev => prev.filter(m => m.id !== id));
  };

  return (
    <BookingContext.Provider
      value={{
        hallInfo,
        movies,
        seatCategories: SEAT_CATEGORIES,
        snacksList: GIRIJA_CANTEEN_SNACKS,
        coupons: GIRIJA_COUPONS,
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
        finalizeBookingWithNepalPay,
        addMovie,
        deleteMovie,
        calculateSeatSubtotal,
        calculateSnacksTotal,
        calculateServiceCharge,
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
