/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Glassmorphic + Arcade brand colors
        brand: {
          DEFAULT: '#34F5C5', // mint
          50: '#F0FEFB',
          100: '#CCFEF0', 
          200: '#9AFCE1',
          300: '#5FF6CF',
          400: '#34F5C5',
          500: '#1BE0B0',
          600: '#0FC49B',
          700: '#0A9D7E',
          800: '#087A62',
          900: '#0B1B1A',
        },
        accent: {
          DEFAULT: '#9B5CFF', // violet
          50: '#F7F3FF',
          100: '#EDE4FF',
          200: '#DDD0FF',
          300: '#C4B0FF',
          400: '#A584FF',
          500: '#9B5CFF',
          600: '#8B3EF7',
          700: '#7B2BE3',
          800: '#6623BF',
          900: '#1A1130',
        },
        ink: {
          DEFAULT: '#EAF7F5',
          dim: '#9FB7B2',
          darker: '#5C6E6B',
        },
        bg: '#060A0A',
        glass: 'rgba(255, 255, 255, 0.08)',
        'glass-strong': 'rgba(255, 255, 255, 0.12)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1rem', // Default for cards/buttons
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glass': '0 10px 30px rgba(0, 0, 0, 0.35)',
        'glass-sm': '0 4px 12px rgba(0, 0, 0, 0.25)',
        'brand-glow': '0 0 20px rgba(52, 245, 197, 0.3)',
        'accent-glow': '0 0 20px rgba(155, 92, 255, 0.3)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(52, 245, 197, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(52, 245, 197, 0.6)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(155, 92, 255, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(155, 92, 255, 0.4)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
      backdropBlur: {
        'glass': '18px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};