/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b1020',
        card: '#141b34',
        accentCyan: '#4cc9f0',
        accentPink: '#f72585',
        accentLime: '#b8f34c',
        muted: '#8a94b8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
