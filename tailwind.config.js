/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Modern color palette
      colors: {
        primary: {
          50: 'rgb(238 242 255)',
          100: 'rgb(224 231 255)',
          500: 'rgb(99 102 241)',
          600: 'rgb(91 92 246)',
          700: 'rgb(79 70 229)',
          900: 'rgb(49 46 129)',
        },
        secondary: {
          50: 'rgb(255 251 235)',
          100: 'rgb(254 243 199)',
          500: 'rgb(245 158 11)',
          600: 'rgb(217 119 6)',
        },
        success: {
          50: 'rgb(236 253 245)',
          500: 'rgb(16 185 129)',
          600: 'rgb(5 150 105)',
        },
        error: {
          50: 'rgb(254 242 242)',
          500: 'rgb(239 68 68)',
          600: 'rgb(220 38 38)',
        },
        gray: {
          50: 'rgb(248 250 252)',
          100: 'rgb(241 245 249)',
          200: 'rgb(226 232 240)',
          300: 'rgb(203 213 225)',
          400: 'rgb(148 163 184)',
          500: 'rgb(100 116 139)',
          600: 'rgb(71 85 105)',
          700: 'rgb(51 65 85)',
          800: 'rgb(30 41 59)',
          900: 'rgb(15 23 42)',
        }
      },
      // Modern spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Modern border radius
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      // Modern shadows
      boxShadow: {
        'soft': '0 2px 8px 0 rgb(0 0 0 / 0.05)',
        'medium': '0 4px 12px 0 rgb(0 0 0 / 0.1)',
        'large': '0 8px 24px 0 rgb(0 0 0 / 0.15)',
      },
      // Modern font sizes
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      // Animation durations
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      // Modern animations
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      // Screen sizes for mobile-first
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
};
