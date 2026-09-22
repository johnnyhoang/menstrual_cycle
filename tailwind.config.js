/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coquette: {
          50: '#fff5f7',
          100: '#fce7f3',
          200: '#f8bbd0',
          300: '#f4a6c6',
          400: '#f078a8',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          bg: '#fcf7f8',
          card: '#ffffff',
          text: '#6a4c46',
          subtext: '#4a4c46',
          border: '#f8bbd0'
        },
        medical: {
          50: '#f0fdf9',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        rosepath: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Be Vietnam Pro"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        comfortaa: ['Comfortaa', 'cursive', 'sans-serif'],
        serif: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
