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
          DEFAULT: '#4F46E5',
          light: '#818CF8',
          dark: '#4338CA',
          50: '#EEF2FF',
          900: '#312E81',
        },
        accent: {
          DEFAULT: '#D97706',
          light: '#FBBF24',
          dark: '#B45309',
        },
        mode: {
          strategy: { DEFAULT: '#4F46E5', light: '#818CF8', bg: '#EEF2FF', dark: '#4338CA' },
          player: { DEFAULT: '#059669', light: '#34D399', bg: '#ECFDF5', dark: '#047857' },
          designer: { DEFAULT: '#7C3AED', light: '#A78BFA', bg: '#F5F3FF', dark: '#6D28D9' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
