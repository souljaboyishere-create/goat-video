/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
      },
      colors: {
        charcoal: {
          DEFAULT: '#0D0D0D',
          light: '#1A1A1A',
        },
        cream: {
          DEFAULT: '#F5F2EB',
          muted: '#E8E5DD',
        },
        amber: {
          DEFAULT: '#E8A849',
          dark: '#D4942A',
        },
        teal: {
          DEFAULT: '#3A6B7C',
          light: '#4A7B8C',
        },
        text: {
          primary: '#F5F2EB',
          secondary: '#B8B5AE',
          muted: '#8A8780',
        },
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: {
        'touch': '44px', // iOS minimum touch target
      },
      minWidth: {
        'touch': '44px',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-down': 'slideDown 0.3s ease-out both',
        'stagger-1': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
        'stagger-2': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
        'stagger-3': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both',
        'underline': 'underline 0.3s ease-out both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(30px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: 0, transform: 'translateY(-10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        underline: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
    },
  },
  plugins: [],
};

