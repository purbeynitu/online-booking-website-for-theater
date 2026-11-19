/**
 * Unified API Client for Girija Cinema Hall
 * Connects Frontend (React/Vite) to Backend (Express + Prisma + Supabase + NepalPay)
 */

// Determine API Base URL
// In development Vite proxies /api to http://localhost:5000
// In production or custom deployment, VITE_API_URL can be set
const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      // In local dev, direct to localhost:5000 if not proxying, or use empty base for proxy
      return 'http://localhost:5000';
    }
  }
  return '';
};

export const API_BASE = getApiBase();

/**
 * Generic request helper with timeout and error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 8000);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const errMsg = (data && data.message) || (data && data.error) || `Request failed with status ${res.status}`;
      throw new Error(errMsg);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/* ============================================================
   HEALTH & SYSTEM STATUS
   ============================================================ */
export async function fetchBackendHealth() {
  try {
    const res = await request('/health', { timeout: 3000 });
    return { connected: true, data: res };
  } catch (e) {
    try {
      // Try /api/admin/health fallback
      const res2 = await request('/api/admin/health', { timeout: 3000 });
      return { connected: true, data: res2 };
    } catch (err) {
      return { connected: false, error: err.message };
    }
  }
}

/* ============================================================
   MOVIES API
   ============================================================ */
export async function apiGetMovies() {
  return await request('/api/movies');
}

export async function apiGetMovieById(id) {
  return await request(`/api/movies/${encodeURIComponent(id)}`);
}

export async function apiCreateMovie(movieData, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return await request('/api/movies', {
    method: 'POST',
    headers,
    body: JSON.stringify(movieData)
  });
}

export async function apiDeleteMovie(id, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return await request(`/api/movies/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers
  });
}

/* ============================================================
   SHOWS & SEATS API
   ============================================================ */
export async function apiGetHallInfo() {
  return await request('/api/shows/hall-info');
}

export async function apiGetShows({ movieId, date } = {}) {
  const params = new URLSearchParams();
  if (movieId) params.append('movieId', movieId);
  if (date) params.append('date', date);
  const q = params.toString() ? `?${params.toString()}` : '';
  return await request(`/api/shows${q}`);
}

export async function apiFindOrCreateShow({ movieId, screenId, screenName, date, startTime }) {
  const params = new URLSearchParams();
  if (movieId) params.append('movieId', movieId);
  if (screenId) params.append('screenId', screenId);
  if (screenName) params.append('screenName', screenName);
  if (date) params.append('date', date);
  if (startTime) params.append('startTime', startTime);
  return await request(`/api/shows/find-or-create?${params.toString()}`);
}

export async function apiGetSeatsForShow(showId) {
  return await request(`/api/shows/${encodeURIComponent(showId)}/seats`);
}

/* ============================================================
   SEAT LOCKING (ACID Concurrency)
   ============================================================ */
export async function apiHoldSeats({ showId, seatIds, holderId }) {
  return await request('/api/bookings/hold-seats', {
    method: 'POST',
    body: JSON.stringify({ showId, seatIds, holderId })
  });
}

export async function apiReleaseSeats({ showId, seatIds, holderId }) {
  return await request('/api/bookings/release-seats', {
    method: 'POST',
    body: JSON.stringify({ showId, seatIds, holderId })
  });
}

/* ============================================================
   BOOKINGS & TICKETS API
   ============================================================ */
export async function apiCreateBooking(bookingPayload) {
  return await request('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingPayload)
  });
}

export async function apiLookupBookings(searchQuery = '') {
  const q = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
  return await request(`/api/bookings${q}`);
}

export async function apiGetBookingByRef(bookingRef) {
  return await request(`/api/bookings/${encodeURIComponent(bookingRef)}`);
}

/* ============================================================
   NEPALPAY & PAYMENT INTEGRATION API
   ============================================================ */
export async function apiGenerateNepalPayQr({ amount, bookingRef, customerName }) {
  return await request('/api/payments/nepalpay/qr', {
    method: 'POST',
    body: JSON.stringify({ amount, bookingRef, customerName })
  });
}

export async function apiGenerateEsewaSignature({ totalAmount, transactionUuid }) {
  return await request('/api/payments/esewa/sign', {
    method: 'POST',
    body: JSON.stringify({ totalAmount, transactionUuid })
  });
}

/* ============================================================
   ADMIN API
   ============================================================ */
export async function apiAdminLogin(username, password) {
  return await request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

export async function apiGetAdminStats(token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return await request('/api/admin/stats', { headers });
}
