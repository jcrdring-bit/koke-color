/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF8F5',
        brand: {
          50: '#f2f8f3',
          100: '#e1efe4',
          200: '#c5e0cb',
          300: '#9ecaa8',
          400: '#529762',
          500: '#23733b',
          600: '#1b5a2e',
          700: '#164e28',
          800: '#123f21',
          900: '#0e311a',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F5F2EC',
          border: '#E7E5E4',
        },
        charcoal: {
          DEFAULT: '#1C1917',
          muted: '#78716C',
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Instrument Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
