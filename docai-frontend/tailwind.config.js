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
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
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
        // REFINED LAVENDER COLOR PALETTE - Updated Theme
        lavender: {
          25: '#FAF9FF',
          50: '#F5F3FF',
          100: '#EAEFFE',
          200: '#DCD8FF',
          300: '#C9BFFF',
          400: '#B6A6FF',
          500: '#F4BFFF',   // Accent/Hover - Updated to bright pinkish lavender
          600: '#7C6EE0',
          700: '#5f597c',   // Primary UI Elements - Mid-tone lavender
          800: '#2d2a3e',   // Main Background - Deep dark lavender
          900: '#1B1830',
          text: '#e6e6fa',  // Primary Text & Icons - Light lavender/off-white
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'bento': '1.5rem',
        'bento-lg': '2rem',
        'bento-xl': '2.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'lavender-sm': '0 1px 2px 0 rgba(151, 135, 243, 0.05)',
        'lavender': '0 1px 3px 0 rgba(151, 135, 243, 0.1), 0 1px 2px 0 rgba(151, 135, 243, 0.06)',
        'lavender-md': '0 4px 6px -1px rgba(151, 135, 243, 0.1), 0 2px 4px -1px rgba(151, 135, 243, 0.06)',
        'lavender-lg': '0 10px 15px -3px rgba(151, 135, 243, 0.1), 0 4px 6px -2px rgba(151, 135, 243, 0.05)',
        'lavender-xl': '0 20px 25px -5px rgba(151, 135, 243, 0.1), 0 10px 10px -5px rgba(151, 135, 243, 0.04)',
        'bento': '0 8px 16px -4px rgba(151, 135, 243, 0.08), 0 4px 8px -2px rgba(151, 135, 243, 0.04)',
        'bento-lg': '0 16px 32px -8px rgba(151, 135, 243, 0.12), 0 8px 16px -4px rgba(151, 135, 243, 0.06)',
        'bento-hover': '0 20px 40px -10px rgba(151, 135, 243, 0.15), 0 10px 20px -5px rgba(151, 135, 243, 0.08)',
      },
    },
  },
  plugins: [],
}