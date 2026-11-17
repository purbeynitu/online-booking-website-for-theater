// Girija Cinema Hall, Janakpurdham, Nepal - Official Mock Database

export const GIRIJA_HALL_INFO = {
  id: "girija-hall-janakpur",
  name: "Girija Cinema Hall",
  nepaliName: "गिरिजा सिनेमा हल",
  tagline: "Janakpur's Premier Single-Screen & Digital Movie Destination",
  address: "Station Road (Near Ramanand Chowk), Janakpurdham - 45600, Dhanusha, Nepal",
  phone: "+977 41-520123 / +977 9801234567",
  email: "booking@girijacinema.com.np",
  established: "1982 (Upgraded to Digital 2K Dolby 2023)",
  screens: [
    {
      id: "audi-1",
      name: "Audi 1: Main Hall (Dolby Atmos 7.1)",
      capacity: 380,
      soundSystem: "Dolby Surround 7.1 with JBL Pro Audio",
      projection: "Barco 2K Digital Cinema with Silver Curved Screen"
    },
    {
      id: "audi-2",
      name: "Audi 2: Gold Class (Qube Digital)",
      capacity: 220,
      soundSystem: "Qube Master Sound",
      projection: "Christie Digital Laser"
    }
  ],
  showtimes: ["11:30 AM", "02:30 PM", "05:45 PM", "08:45 PM"],
  paymentPartners: ["NepalPay", "eSewa", "Khalti", "connectIPS", "Fonepay"]
};

export const INITIAL_MOVIES = [
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
    releaseDate: "2024-10-31",
    status: "now-showing",
    banner: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=4rgYUipGJNo",
    synopsis: "The highest grossing film in Nepali cinema history. A heartbreaking and deeply moving story of an impoverished Gandharva father in rural Nepal who sacrifices everything to educate his beloved son.",
    cast: [
      { name: "Bijay Baral", role: "Purna Bahadur" },
      { name: "Prakash Saput", role: "Kamal" },
      { name: "Anjana Baraili", role: "Radhika" },
      { name: "Mukun Bhusal", role: "Birendra" }
    ],
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
    ageRating: "A (16+)",
    releaseDate: "2024-10-11",
    status: "now-showing",
    banner: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop",
    poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=600&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=1kVK0MZlbI4",
    synopsis: "An adrenaline-fueled, high-octane action thriller set across twelve ruthless village territories where a fearless young fighter rises to dismantle an entrenched criminal mafia.",
    cast: [
      { name: "Biraj Bhatta", role: "Shankar" },
      { name: "Samir Bhatta", role: "Karan" },
      { name: "Sonu Chandrapal", role: "Pooja" }
    ],
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
    releaseDate: "2024-12-05",
    status: "now-showing",
    banner: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=1600&auto=format&fit=crop",
    poster: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=1kVK0MZlbI4",
    synopsis: "The clash of egos escalates as Pushpa Raj expands his empire while SP Bhanwar Singh Shekhawat vows retribution in this massive blockbuster showdown at Girija Cinema.",
    cast: [
      { name: "Allu Arjun", role: "Pushpa Raj" },
      { name: "Rashmika Mandanna", role: "Srivalli" },
      { name: "Fahadh Faasil", role: "Bhanwar Singh" }
    ],
    director: "Sukumar"
  },
  {
    id: "mov-behuli",
    title: "Behuli From Meghauli",
    nepaliTitle: "बेहुली फ्रम मेघौली",
    genre: ["Comedy", "Romance", "Social"],
    language: "Nepali",
    formats: ["2D Digital"],
    rating: 8.2,
    votes: "32.1K",
    duration: "2h 10m",
    ageRating: "U",
    releaseDate: "2024-10-03",
    status: "now-showing",
    banner: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=6COmYeL944A",
    synopsis: "A lighthearted cultural satire about marriage proposals, eccentric family traditions, and romance in the scenic village of Meghauli, Chitwan.",
    cast: [
      { name: "Swastima Khadka", role: "Behuli" },
      { name: "Nischal Basnet", role: "Behula" },
      { name: "Basundhara Bhusal", role: "Aama" }
    ],
    director: "Sajan Shrestha"
  },
  {
    id: "mov-lorik",
    title: "Lorik (मिथिला / भोजपुरी)",
    nepaliTitle: "वीर लोरिक",
    genre: ["Folk", "Epic", "Historical"],
    language: "Maithili / Bhojpuri",
    formats: ["2D Digital"],
    rating: 8.5,
    votes: "18.4K",
    duration: "2h 18m",
    ageRating: "UA",
    releaseDate: "2024-11-25",
    status: "now-showing",
    banner: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1600&auto=format&fit=crop",
    poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=4rgYUipGJNo",
    synopsis: "The legendary folk tale of Veer Lorik, celebrated across Mithilanchal and Janakpurdham, depicting chivalry, love, and righteousness.",
    cast: [
      { name: "Khesari Lal", role: "Lorik" },
      { name: "Kajal Raghwani", role: "Manjiri" }
    ],
    director: "Devendra Tiwari"
  },
  {
    id: "mov-gladiator-2",
    title: "Gladiator II",
    nepaliTitle: "ग्लेडिएटर २",
    genre: ["Action", "Drama", "Epic"],
    language: "English (Subtitled)",
    formats: ["2D Digital", "Dolby Atmos"],
    rating: 8.4,
    votes: "45.1K",
    duration: "2h 28m",
    ageRating: "A",
    releaseDate: "2024-11-15",
    status: "coming-soon",
    banner: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?q=80&w=1600&auto=format&fit=crop",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=4rgYUipGJNo",
    synopsis: "Lucius must enter the Colosseum after his home is conquered by tyrannical emperors who lead Rome with an iron fist.",
    cast: [
      { name: "Paul Mescal", role: "Lucius" },
      { name: "Denzel Washington", role: "Macrinus" }
    ],
    director: "Ridley Scott"
  }
];

export const SEAT_CATEGORIES = [
  {
    id: "balcony",
    name: "Balcony (बाल्कोनी)",
    nepaliName: "बाल्कोनी क्लास",
    price: 300,
    rows: ["A", "B", "C"],
    description: "Top-tier elevated view with cushioned push-back seats and personal legroom"
  },
  {
    id: "deluxe",
    name: "Deluxe / First Class (डिलक्स)",
    nepaliName: "पहिलो दर्जा (डिलक्स)",
    price: 220,
    rows: ["D", "E", "F", "G"],
    description: "Center viewing angle with comfortable padded cinema chairs"
  },
  {
    id: "standard",
    name: "Standard (साधारण)",
    nepaliName: "साधारण दर्जा",
    price: 150,
    rows: ["H", "I", "J"],
    description: "Front floor seating with full audio clarity"
  }
];

export const GIRIJA_CANTEEN_SNACKS = [
  {
    id: "snk-1",
    name: "Fresh Butter Salted Popcorn (पपकर्न)",
    category: "Popcorn",
    price: 120,
    calories: "320 kcal",
    image: "🍿",
    popular: true
  },
  {
    id: "snk-2",
    name: "Janakpur Famous Samosa Chaat (समोसा २ पिस)",
    category: "Local Snacks",
    price: 100,
    calories: "280 kcal",
    image: "🥟",
    popular: true
  },
  {
    id: "snk-3",
    name: "Crispy Wai Wai Sadeko (चाउचाउ साँधेको)",
    category: "Local Snacks",
    price: 80,
    calories: "260 kcal",
    image: "🍜",
    popular: true
  },
  {
    id: "snk-4",
    name: "Chilled Coca-Cola / Fanta (५०० मि.ली.)",
    category: "Cold Drinks",
    price: 70,
    calories: "140 kcal",
    image: "🥤",
    popular: false
  },
  {
    id: "snk-5",
    name: "Girija Special Masala Tea (मट्का चिया)",
    category: "Hot Beverages",
    price: 35,
    calories: "80 kcal",
    image: "☕",
    popular: false
  },
  {
    id: "snk-6",
    name: "Mithila Cinema Combo (Popcorn + Samosa + 2 Cokes)",
    category: "Combos",
    price: 320,
    calories: "680 kcal",
    image: "🎬",
    popular: true
  }
];

export const GIRIJA_COUPONS = [
  {
    code: "GIRIJA50",
    discountAmount: 50,
    minAmount: 300,
    description: "Flat रू ५० OFF on orders above रू ३००"
  },
  {
    code: "JANAKPUR20",
    discountPercent: 20,
    maxDiscount: 120,
    minAmount: 400,
    description: "२०% छुट (Flat 20% OFF up to रू १२० on Balcony seats)"
  },
  {
    code: "NEPALPAY10",
    discountPercent: 10,
    maxDiscount: 60,
    minAmount: 200,
    description: "१०% छुट on payments made via NepalPay QR or eSewa/Khalti"
  }
];

export const SAMPLE_BOOKINGS = [
  {
    bookingId: "GJ-892104",
    createdAt: "2024-11-17T11:20:00Z",
    movieTitle: "Purna Bahadur Ko Sarangi",
    moviePoster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop",
    theatreName: "Girija Cinema Hall, Janakpur",
    city: "Janakpurdham, Dhanusha, Nepal",
    screen: "Audi 1: Main Hall (Dolby Atmos 7.1)",
    format: "2D Digital",
    date: "2024-11-17",
    time: "02:30 PM",
    seats: ["B6", "B7"],
    customerName: "Ramesh Jha",
    customerEmail: "ramesh.jha@gmail.com",
    customerPhone: "9801234567",
    totalAmount: 640,
    gateway: "nepalpay_qr",
    nepalPayTxId: "NPAY-QR-7829143",
    status: "CONFIRMED"
  }
];
