/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf2f4',
          100: '#fde6e9',
          200: '#fbd0d7',
          300: '#f7aab7',
          400: '#f2788d',
          500: '#e53e5d',
          600: '#d02547',
          700: '#af1a37',
          800: '#911931',
          900: '#7a1a2e',
          950: '#430914',
        },
        cinema: {
          dark: '#0B0F19',
          card: '#121826',
          border: '#1F293D',
          surface: '#182032',
          accent: '#E50914',
          gold: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(229, 62, 93, 0.4)',
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
      }
    },
  },
  plugins: [],
}
