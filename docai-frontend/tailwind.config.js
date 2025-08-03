/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // LAVENDER COLOR PALETTE
        lavender: {
          25: '#FEFCFF',    
          50: '#FDFCFE',
          100: '#F9F5FE',
          200: '#F3ECFD',
          300: '#EADCFB',
          400: '#DCC3F8',
          500: '#C9A1F3',
          600: '#B57EDC',
          700: '#A159C5',
          800: '#893D9E',
          900: '#6C2A7B',
          950: '#4D1D57',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'lavender-sm': '0 1px 2px 0 rgba(181, 126, 220, 0.05)',
        'lavender': '0 1px 3px 0 rgba(181, 126, 220, 0.1), 0 1px 2px 0 rgba(181, 126, 220, 0.06)',
        'lavender-md': '0 4px 6px -1px rgba(181, 126, 220, 0.1), 0 2px 4px -1px rgba(181, 126, 220, 0.06)',
        'lavender-lg': '0 10px 15px -3px rgba(181, 126, 220, 0.1), 0 4px 6px -2px rgba(181, 126, 220, 0.05)',
        'lavender-xl': '0 20px 25px -5px rgba(181, 126, 220, 0.1), 0 10px 10px -5px rgba(181, 126, 220, 0.04)',
      },
    },
  },
  plugins: [],
}