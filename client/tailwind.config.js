/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0b0718',
        card: '#171130',
        neon: '#ff2e88',
        accent: '#7c5cff',
      },
      boxShadow: {
        glow: '0 0 40px rgba(124, 92, 255, 0.35)',
      },
    },
  },
  plugins: [],
};
