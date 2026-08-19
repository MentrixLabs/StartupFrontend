// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Добавляем полупрозрачные варианты для стеклянных карточек
        glass: {
          light: 'rgba(255,255,255,0.7)',
          dark: 'rgba(30,30,30,0.8)',
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
      },
      boxShadow: {
        'apple': '0 4px 20px rgba(0,0,0,0.08)',
        'apple-dark': '0 4px 30px rgba(0,0,0,0.3)',
        'apple-hover': '0 8px 30px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        'xl': '1rem',    // 16px
        '2xl': '1.5rem', // 24px
        '3xl': '2rem',   // 32px
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%': { boxShadow: '0 0 0 0 rgba(59,130,246,0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(59,130,246,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(59,130,246,0)' },
        },
      },
    },
  },
};