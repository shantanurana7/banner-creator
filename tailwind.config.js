/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0D1117',
          50: '#161B22',
          100: '#1C2128',
          200: '#21262D',
          300: '#30363D',
          400: '#484F58',
          500: '#6E7681',
        },
        panel: {
          DEFAULT: '#161B22',
          light: '#1C2128',
          border: '#30363D',
        },
        accent: {
          DEFAULT: '#00338d',
          light: '#1e49e2',
          lighter: '#00b8f5',
          ice: '#ACEAFF',
        },
        kpmg: {
          dark: '#0c233c',
          blue: '#00338d',
          bright: '#1e49e2',
          sky: '#00b8f5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        condenseBold: ['CondeSansBold', 'Arial Narrow', 'sans-serif'],
        universStd: ['UniversLTStd', 'Helvetica', 'sans-serif'],
        universBold: ['UniversLTStdBold', 'Helvetica', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 51, 141, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 51, 141, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
