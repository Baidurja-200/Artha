/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#D4AF37',
          600: '#B8941E',
          700: '#9A7B15',
          800: '#7C620E',
          900: '#5E4A0A',
        },
        dark: {
          50: '#2a2a2e',
          100: '#232327',
          200: '#1e1e22',
          300: '#1a1a1e',
          400: '#161619',
          500: '#121215',
          600: '#0e0e11',
          700: '#0a0a0d',
          800: '#070709',
          900: '#040405',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #D4AF37, #F4E076, #D4AF37)',
        'gradient-gold-dark': 'linear-gradient(135deg, #B8941E, #D4AF37, #9A7B15)',
        'gradient-dark': 'linear-gradient(180deg, #0a0a0d, #121215, #1a1a1e)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(212, 175, 55, 0.15)',
        'gold-lg': '0 0 40px rgba(212, 175, 55, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-lg': '0 16px 64px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'score-fill': 'scoreFill 2s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(212, 175, 55, 0.1)' },
          '100%': { boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scoreFill: {
          '0%': { strokeDashoffset: '440' },
          '100%': { strokeDashoffset: 'var(--score-offset)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
