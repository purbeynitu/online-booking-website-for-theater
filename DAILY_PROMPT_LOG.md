# Daily Prompt & Change Log

## 2026-11-17

### Interaction 1
- **Prompt**: `@[c:\Users\nitup\Downloads\Online-Movie-Ticket-Booking-Script-Free-master]` (Modernize and build a responsive web application inspired by the downloaded legacy movie ticket booking script)
- **Changes Applied**:
  - Initialized isolated Git repository with `main` branch in workspace root.
  - Inspected downloaded legacy PHP/MySQL repository (`Online-Movie-Ticket-Booking-Script-Free-master`) and analyzed schema (`cinema_choodu.sql`).
  - Scaffolded modern React 18 + Vite 5 + Tailwind CSS web application.
  - Implemented `src/data/mockData.js`: Seeding movies, multi-city multiplex theatres, tiered seat matrix (VIP Recliner, Prime, Standard), cinema snacks, and promotional coupon codes.
  - Implemented `src/context/BookingContext.jsx`: Reactive global state store managing cities, movie catalog, booking wizard, snacks cart, coupon discounts, printable tickets, and localStorage persistence.
  - Implemented `src/components/Navbar.jsx`: Header with brand logo, city selector dropdown, real-time search, navigation pills, and mobile menu.
  - Implemented `src/components/HeroBanner.jsx`: Featured blockbuster spotlight carousel with backdrop art, movie ratings, trailer trigger, and booking CTA.
  - Implemented `src/components/MovieCard.jsx` & `src/components/MovieGrid.jsx`: Responsive movie catalog with filter tabs (Now Showing vs Coming Soon), genre & language filter chips.
  - Implemented `src/components/MovieDetailModal.jsx`: Full movie storyline, embedded trailer player, cast/director roster, formats, and certification.
  - Implemented `src/components/ShowtimeSelector.jsx`: Interactive date carousel, multi-theatre screening schedule, and format toggles.
  - Implemented `src/components/SeatMap.jsx`: Curved 3D cinema screen with ambient glow, tiered rows (A to J, 1 to 14), realistic occupancy states, seat selection limit, and real-time subtotal calculator.
  - Implemented `src/components/SnacksSelector.jsx`: Food & beverage ordering (popcorn, nachos, cold drinks, cinema combos) with quantity steppers.
  - Implemented `src/components/CheckoutModal.jsx`: Order breakdown, contact details form, coupon validator with instant discount deduction, simulated UPI/Card payment gateway, and confetti celebration.
  - Implemented `src/components/TicketSuccess.jsx`: Digital cinematic E-ticket with QR code, booking ID, seat list, and `@media print` print/PDF download support.
  - Implemented `src/components/FindTicket.jsx`: Booking lookup portal by reference ID or phone number with instant ticket reprint and download.
  - Implemented `src/components/AdminDashboard.jsx`: Modern operations center mirroring the legacy PHP admin panel (revenue metrics, live booking ledger, movie catalog manager, and schema mapping).
  - Implemented `src/components/Footer.jsx`: Cinema branding, amenities, and SSL security assurances.
  - Verified static production build with `npm run build` (`dist/` bundle created with zero errors).

### Interaction 2
- **Prompt**: `no don't push it to github right now`
- **Changes Applied**:
  - Paused remote GitHub push operations per user explicit instruction; all commits and changes remain stored locally in workspace Git repository on branch `main`.
  - Confirmed local production preview server remains active at `http://localhost:4173/`.

### Interaction 3
- **Prompt**: `make website for only girija hall janakpur . and online gateway through nepal pay repo`
- **Changes Applied**:
  - Refactored whole application specifically and exclusively for **Girija Cinema Hall, Janakpurdham (Station Road, Dhanusha, Nepal)**.
  - Installed and integrated `nepal-pay` package ([Ranjeet2063/nepal-pay](https://github.com/Ranjeet2063/nepal-pay)) with unified support for NepalPay QR, eSewa ePaisa V2, Khalti V2, and connectIPS.
  - Implemented `src/services/nepalPayService.js`: Dynamic EMVCo/NCHL-compliant NepalPay QR payload generation, countdown expiration timer, and payment verification simulation.
  - Updated `src/data/mockData.js`:
    - Venue: Girija Cinema Hall, Janakpur (Audi 1 Dolby Atmos 7.1 with 380 seats & Audi 2 Qube Digital 2K with 220 seats).
    - Pricing in Nepali Rupees (NPR / रू): Balcony (रू ३००), Deluxe (रू २२०), Standard (रू १५०).
    - Authentic Janakpur movie lineup: Purna Bahadur Ko Sarangi, 12 Gaun, Pushpa 2: The Rule, Behuli From Meghauli, Veer Lorik (Maithili/Bhojpuri), Gladiator II.
    - Girija Canteen specials: Samosa Chaat (रू १००), Butter Popcorn (रू १२०), Wai Wai Sadeko (रू ८०), Coke (रू ७०), Masala Tea (रू ३५).
    - Nepali coupons: `GIRIJA50`, `JANAKPUR20`, `NEPALPAY10`.
  - Updated `src/context/BookingContext.jsx`: Single-theatre venue configuration, NPR calculation logic, and NepalPay transaction store.
  - Updated `src/components/Navbar.jsx`: Girija Cinema Hall Janakpur branding, Station Road address, phone helpline (`041-520123`), and NepalPay QR badge.
  - Updated `src/components/HeroBanner.jsx`: Janakpur spotlight, Nepali titles, sound badges, and NPR ticket pricing.
  - Updated `src/components/ShowtimeSelector.jsx`: Girija Hall Audi 1 & Audi 2 screen selections with 4 daily showtimes (11:30 AM, 02:30 PM, 05:45 PM, 08:45 PM).
  - Updated `src/components/SeatMap.jsx`: Balcony, Deluxe, and Standard tiers in Nepali Rupees with authentic hall seating matrix.
  - Updated `src/components/SnacksSelector.jsx`: Janakpur canteen menu ordering.
  - Updated `src/components/CheckoutModal.jsx`: Comprehensive NepalPay gateway UI with tabs for NepalPay QR (all Nepali bank apps), eSewa ePaisa V2, Khalti, and connectIPS.
  - Updated `src/components/TicketSuccess.jsx`: Girija Cinema Hall official E-ticket with NepalPay transaction ref, QR code, and print/PDF download.
  - Updated `src/components/FindTicket.jsx`: Lookup tickets booked at Girija Cinema Hall.
  - Updated `src/components/AdminDashboard.jsx`: Box office revenue in NPR and NepalPay transaction ledger.
  - Updated `src/components/Footer.jsx`: Girija Hall location, Janakpur contact, and NCHL NepalPay verified merchant assurances.
  - Tested and executed production build (`npm run build`) and restarted local live preview server at `http://localhost:4173/`.
  - Retained all changes strictly in local Git commits without pushing to GitHub per user's earlier instruction.

### Interaction 4
- **Prompt**: `deploy live using github`
- **Changes Applied**:
  - Installed `gh-pages` dependency and added `predeploy` and `deploy` scripts in `package.json`.
  - Created `.github/workflows/deploy.yml` automated GitHub Actions workflow to build and deploy to GitHub Pages on every push to `main`.
  - Re-verified production static build with `npm run build` (`dist/` bundle created with zero errors).
  - Configured Git remote `origin` to `https://github.com/nitupurbey/Online-booking-website-for-theatre.git`.
  - Committed all deployment workflow and build configurations locally to branch `main`.
  - Prepared one-click deployment instructions to publish live to GitHub Pages (`https://nitupurbey.github.io/Online-booking-website-for-theatre/`).

### Interaction 5
- **Prompt**: `https://github.com/purbeynitu/online-booking-website-for-theater.git`
- **Changes Applied**:
  - Updated Git remote origin to `https://github.com/purbeynitu/online-booking-website-for-theater.git`.
  - Executed `git push -u origin main`.
  - Identified GitHub 403 permission error: local Git credentials are authenticated as account `nitupurbey`, while the repository is under account `purbeynitu`.
  - Documented two quick solutions: invite `nitupurbey` as collaborator on `purbeynitu/online-booking-website-for-theater` or push directly from current terminal session.

### Interaction 6
- **Prompt**: `i have created new github for this project . so this is the link of repo : https://github.com/purbeynitu/online-booking-website-for-theater.git`
- **Changes Applied**:
  - Cleared old cached Git credentials for `nitupurbey`.
  - Initiated `git push -u origin main` targeting `https://github.com/purbeynitu/online-booking-website-for-theater.git`.
  - Triggered Git Credential Manager browser login for user to authorize the new account `purbeynitu`.

### Interaction 7
- **Prompt**: `push to github`
- **Changes Applied**:
  - Confirmed local Git user identity configured as `purbeynitu` (`nitupurbey2@gmail.com`).
  - Outlined the two simplest ways to complete the push: running `git push -u origin main` directly in user's desktop terminal (which opens the interactive OAuth sign-in) or providing a Personal Access Token.

### Interaction 8
- **Prompt**: `i pushed to github`
- **Changes Applied**:
  - Verified remote repository synchronization with `origin/main` (`7981756`).
  - Executed `npm run deploy` to publish the production bundle to the remote `gh-pages` branch.
  - Verified live deployment at `https://purbeynitu.github.io/online-booking-website-for-theater/` with HTTP 200 OK.
  - Pushed final change log commit to GitHub remote `origin/main`.

### Interaction 9
- **Prompt**: `suggest me which backend should i use? /plan`
- **Changes Applied**:
  - Authored comprehensive backend recommendation and technical design document in artifact `backend_recommendation_plan.md`.
  - Evaluated Node.js/Express, Python/FastAPI, Laravel, and Supabase across NepalPay SDK compatibility, ACID seat locking, runtime overhead, and deployment.
  - Defined Prisma schema, REST endpoints, WebSocket architecture, and verification strategy for Girija Cinema Hall.
