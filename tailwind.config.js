/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        studio: {
          dark: '#0c0e12',
          card: '#161920',
          cardHover: '#1c202a',
          border: '#262b37',
          accent: '#10b981', // Monis emerald
          accentHover: '#059669',
          cream: '#f4f1ea',
          wood: '#d4a373',
        }
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'desk': '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        'chair': '0 20px 40px -10px rgba(0, 0, 0, 0.55)',
      }
    },
  },
  plugins: [],
}
