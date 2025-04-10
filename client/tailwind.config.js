/** @type {import('tailwindcss').Config} */
export const content = [
  "./src/**/*.{js,jsx,ts,tsx}",
  "./public/index.html"
];
export const darkMode = 'class';
export const theme = {
  extend: {
    animation: {
      'fade-in': 'fadeIn 0.5s ease-out forwards',
      'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
      'fade-in-down': 'fadeInDown 0.7s ease-out forwards',
      'fade-in-left': 'fadeInLeft 0.7s ease-out forwards',
      'fade-in-right': 'fadeInRight 0.7s ease-out forwards',
      'slide-right': 'slideRight 0.5s ease-out forwards',
      'slide-left': 'slideLeft 0.5s ease-out forwards',
      'pulse-slow': 'pulse 3s infinite',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      fadeInUp: {
        '0%': { opacity: '0', transform: 'translateY(20px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
      fadeInDown: {
        '0%': { opacity: '0', transform: 'translateY(-20px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
      fadeInLeft: {
        '0%': { opacity: '0', transform: 'translateX(-20px)' },
        '100%': { opacity: '1', transform: 'translateX(0)' },
      },
      fadeInRight: {
        '0%': { opacity: '0', transform: 'translateX(20px)' },
        '100%': { opacity: '1', transform: 'translateX(0)' },
      },
      slideRight: {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(0)' },
      },
      slideLeft: {
        '0%': { transform: 'translateX(100%)' },
        '100%': { transform: 'translateX(0)' },
      },
    },

    transitionDelay: {
      '100': '100ms',
      '200': '200ms',
      '300': '300ms',
    },
    variants: {
      extend: {
        scale: ['hover', 'focus'],
        transform: ['hover', 'focus'],
      },
    },
    colors: {
      kinsta: {
        bg: '#0E0A1B',
        purple: '#5333EC',
        teal: '#32D3D8',
      }
    },
    backgroundImage: {
      'gradient-kinsta': 'linear-gradient(135deg, #0E0A1B 0%, #1E0A3B 100%)',
    }
  },
};
export const plugins = [];
