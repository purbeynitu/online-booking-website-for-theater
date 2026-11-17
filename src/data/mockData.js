// Mock dataset for Online Theatre Booking System

export const INITIAL_MOVIES = [
  {
    id: "mov-1",
    title: "Gladiator II",
    genre: ["Action", "Drama", "Epic"],
    language: "English",
    formats: ["IMAX 2D", "4DX", "Dolby Atmos 2D"],
    rating: 8.4,
    votes: "42.5K",
    duration: "2h 28m",
    ageRating: "A (18+)",
    releaseDate: "2024-11-15",
    status: "now-showing",
    banner: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=4rgYUipGJNo",
    synopsis: "Years after witnessing the death of revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.",
    cast: [
      { name: "Paul Mescal", role: "Lucius" },
      { name: "Pedro Pascal", role: "Marcus Acacius" },
      { name: "Denzel Washington", role: "Macrinus" },
      { name: "Connie Nielsen", role: "Lucilla" }
    ],
    director: "Ridley Scott"
  },
  {
    id: "mov-2",
    title: "Interstellar: 10th Anniversary Re-Release",
    genre: ["Sci-Fi", "Adventure", "Drama"],
    language: "English",
    formats: ["IMAX 70mm", "IMAX 2D", "Dolby Atmos"],
    rating: 8.9,
    votes: "115K",
    duration: "2h 49m",
    ageRating: "UA",
    releaseDate: "2024-11-20",
    status: "now-showing",
    banner: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1600&auto=format&fit=crop",
    poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    synopsis: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
    cast: [
      { name: "Matthew McConaughey", role: "Cooper" },
      { name: "Anne Hathaway", role: "Brand" },
      { name: "Jessica Chastain", role: "Murph" },
      { name: "Michael Caine", role: "Professor Brand" }
    ],
    director: "Christopher Nolan"
  },
  {
    id: "mov-3",
    title: "Pushpa 2: The Rule",
    genre: ["Action", "Thriller", "Crime"],
    language: "Telugu",
    formats: ["IMAX 2D", "Dolby Atmos 2D", "2D"],
    rating: 8.7,
    votes: "98.2K",
    duration: "3h 05m",
    ageRating: "UA",
    releaseDate: "2024-12-05",
    status: "now-showing",
    banner: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=1600&auto=format&fit=crop",
    poster: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=1kVK0MZlbI4",
    synopsis: "Pushpa Raj expands his red sandalwood smuggling syndicate, clashing fiercely with SP Bhanwar Singh Shekhawat in an explosive showdown of authority, power, and ego.",
    cast: [
      { name: "Allu Arjun", role: "Pushpa Raj" },
      { name: "Rashmika Mandanna", role: "Srivalli" },
      { name: "Fahadh Faasil", role: "Bhanwar Singh Shekhawat" }
    ],
    director: "Sukumar"
  },
  {
    id: "mov-4",
    title: "Wicked",
    genre: ["Musical", "Fantasy", "Adventure"],
    language: "English",
    formats: ["3D", "2D", "Dolby Atmos"],
    rating: 8.1,
    votes: "28.4K",
    duration: "2h 40m",
    ageRating: "U",
    releaseDate: "2024-11-22",
    status: "now-showing",
    banner: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=6COmYeL944A",
    synopsis: "The untold story of the witches of Oz: Elphaba, a misunderstood young woman born with green skin, and Glinda, a popular blonde girl, become friends before their diverging paths make them the Wicked Witch of the West and Glinda the Good.",
    cast: [
      { name: "Cynthia Erivo", role: "Elphaba" },
      { name: "Ariana Grande", role: "Glinda" },
      { name: "Jonathan Bailey", role: "Fiyero" },
      { name: "Jeff Goldblum", role: "The Wizard" }
    ],
    director: "Jon M. Chu"
  },
  {
    id: "mov-5",
    title: "Moana 2",
    genre: ["Animation", "Adventure", "Comedy"],
    language: "English",
    formats: ["3D", "2D", "4DX"],
    rating: 7.9,
    votes: "19.3K",
    duration: "1h 40m",
    ageRating: "U",
    releaseDate: "2024-11-27",
    status: "coming-soon",
    banner: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=hDZ7y8RP5HE",
    synopsis: "After receiving an unexpected call from her wayfinding ancestors, Moana journeys to the far seas of Oceania and into dangerous, long-lost waters for an adventure unlike anything she's ever faced.",
    cast: [
      { name: "Auli'i Cravalho", role: "Moana" },
      { name: "Dwayne Johnson", role: "Maui" }
    ],
    director: "David Derrick Jr."
  },
  {
    id: "mov-6",
    title: "Mufasa: The Lion King",
    genre: ["Adventure", "Animation", "Drama"],
    language: "English",
    formats: ["IMAX 3D", "3D", "2D"],
    rating: 8.2,
    votes: "14.1K",
    duration: "2h 00m",
    ageRating: "U",
    releaseDate: "2024-12-20",
    status: "coming-soon",
    banner: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?q=80&w=1600&auto=format&fit=crop",
    poster: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?q=80&w=600&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=o17MF9vnabg",
    synopsis: "Told in flashbacks, Rafiki transmits the legend of Mufasa to young lion cub Kiara, daughter of Simba and Nala, with Timon and Pumbaa lending their trademark schtick.",
    cast: [
      { name: "Aaron Pierre", role: "Mufasa" },
      { name: "Kelvin Harrison Jr.", role: "Taka" },
      { name: "Seth Rogen", role: "Pumbaa" }
    ],
    director: "Barry Jenkins"
  }
];

export const CITIES = [
  { id: "hyd", name: "Hyderabad", state: "Telangana" },
  { id: "blr", name: "Bengaluru", state: "Karnataka" },
  { id: "mum", name: "Mumbai", state: "Maharashtra" },
  { id: "del", name: "Delhi NCR", state: "Delhi" },
  { id: "che", name: "Chennai", state: "Tamil Nadu" },
  { id: "kol", name: "Kolkata", state: "West Bengal" }
];

export const THEATRES = [
  {
    id: "th-1",
    name: "PVR ICON IMAX, Nexus Mall",
    cityId: "hyd",
    location: "Kukatpally, Hyderabad",
    screens: ["Screen 1 (IMAX Laser)", "Screen 2 (Dolby Atmos)", "Screen 3 (4DX)"],
    amenities: ["IMAX with Laser", "Dolby Atmos 7.1", "Recliner Seats", "Gourmet Food", "Free Parking"],
    showtimes: ["10:00 AM", "01:30 PM", "05:15 PM", "08:45 PM", "11:30 PM"]
  },
  {
    id: "th-2",
    name: "AMB Cinemas Superplex",
    cityId: "hyd",
    location: "Gachibowli, Hyderabad",
    screens: ["Screen 1 (VIP Laser)", "Screen 2 (Dolby 3D)", "Screen 3 (Luxe)"],
    amenities: ["Barco 4K Laser", "VIP Lounge", "In-seat Butler Service", "Valet Parking"],
    showtimes: ["09:45 AM", "01:00 PM", "04:30 PM", "08:00 PM", "10:45 PM"]
  },
  {
    id: "th-3",
    name: "INOX Insignia, Forum South",
    cityId: "blr",
    location: "Kanakapura Road, Bengaluru",
    screens: ["Screen 1 (Insignia Luxe)", "Screen 2 (Dolby 7.1)"],
    amenities: ["Luxury Recliners", "Chef Curated Menu", "Pillow & Blanket Service"],
    showtimes: ["10:15 AM", "02:00 PM", "05:30 PM", "09:00 PM"]
  },
  {
    id: "th-4",
    name: "PVR Superplex, Phoenix Mall",
    cityId: "mum",
    location: "Kurla West, Mumbai",
    screens: ["Screen 1 (IMAX)", "Screen 2 (4DX)", "Screen 3 (Gold Class)"],
    amenities: ["IMAX Experience", "4DX Motion Chairs", "Star Lounge"],
    showtimes: ["11:00 AM", "02:45 PM", "06:15 PM", "09:45 PM"]
  }
];

export const SEAT_CATEGORIES = [
  {
    id: "vip",
    name: "VIP Recliner",
    price: 380,
    rows: ["A", "B"],
    description: "Ultra plush leather recliners with personal charging port and food service"
  },
  {
    id: "premium",
    name: "Prime / Executive",
    price: 250,
    rows: ["C", "D", "E", "F"],
    description: "Premium viewing angle with cushioned wide headrests"
  },
  {
    id: "standard",
    name: "Standard Stadium",
    price: 160,
    rows: ["G", "H", "I", "J"],
    description: "Elevated stadium seating with crystal clear audio coverage"
  }
];

export const SNACKS = [
  {
    id: "snack-1",
    name: "Jumbo Caramel Popcorn",
    category: "Popcorn",
    price: 260,
    calories: "450 kcal",
    image: "🍿",
    popular: true
  },
  {
    id: "snack-2",
    name: "Cheese Butter Salted Popcorn",
    category: "Popcorn",
    price: 240,
    calories: "420 kcal",
    image: "🍿",
    popular: true
  },
  {
    id: "snack-3",
    name: "Crispy Nachos & Warm Jalapeno Cheese",
    category: "Quick Bites",
    price: 220,
    calories: "380 kcal",
    image: "🧀",
    popular: true
  },
  {
    id: "snack-4",
    name: "Cold Brew Fountain Soda (Large)",
    category: "Beverages",
    price: 150,
    calories: "180 kcal",
    image: "🥤",
    popular: false
  },
  {
    id: "snack-5",
    name: "Cinema Combo: Large Popcorn + 2 Sodas",
    category: "Combos",
    price: 490,
    calories: "780 kcal",
    image: "🎬",
    popular: true
  }
];

export const COUPONS = [
  {
    code: "CINEPASS50",
    discountPercent: 50,
    maxDiscount: 150,
    minAmount: 300,
    description: "50% OFF up to ₹150 on your ticket subtotal"
  },
  {
    code: "BLOCKBUSTER20",
    discountPercent: 20,
    maxDiscount: 200,
    minAmount: 500,
    description: "20% OFF up to ₹200 for orders above ₹500"
  },
  {
    code: "FIRSTSHOW",
    discountPercent: 15,
    maxDiscount: 100,
    minAmount: 200,
    description: "Flat 15% OFF for first time cinema lovers"
  }
];

export const SAMPLE_BOOKINGS = [
  {
    bookingId: "CP-782194",
    createdAt: "2024-11-16T18:30:00Z",
    movieTitle: "Gladiator II",
    moviePoster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop",
    theatreName: "PVR ICON IMAX, Nexus Mall",
    city: "Hyderabad",
    screen: "Screen 1 (IMAX Laser)",
    format: "IMAX 2D",
    date: "2024-11-18",
    time: "05:15 PM",
    seats: ["C7", "C8"],
    customerName: "Rahul Sharma",
    customerEmail: "rahul.s@example.com",
    customerPhone: "9876543210",
    totalAmount: 566,
    status: "CONFIRMED"
  }
];
