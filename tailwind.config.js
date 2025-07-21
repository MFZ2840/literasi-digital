// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}', // Sesuaikan jika struktur proyek Anda berbeda (misal: src/app)
  ],
  theme: {
    extend: {
      keyframes: {
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // --- START Tambahan untuk slight-spin ---
        'slight-spin': {
          '0%, 100%': { transform: 'rotate(-2deg)' }, // Mulai dan berakhir dengan sedikit rotasi ke kiri
          '50%': { transform: 'rotate(2deg)' },      // Tengah animasi: sedikit rotasi ke kanan
        },
        // --- END Tambahan untuk slight-spin ---
      },
      animation: {
        'scale-in': 'scale-in 0.2s ease-out forwards',
        'fade-in': 'fade-in 0.2s ease-out forwards', // Untuk overlay
        // --- START Tambahan untuk slight-spin ---
        'slight-spin': 'slight-spin 3s ease-in-out infinite alternate', // Durasi 3s, easing, berulang, bolak-balik
        // --- END Tambahan untuk slight-spin ---
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}