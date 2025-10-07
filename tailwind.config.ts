import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Cosmic Constellations Theme
        'deep-navy': 'hsl(var(--deep-navy))',
        'dark-space': 'hsl(var(--dark-space))',
        'purple-dark': 'hsl(var(--purple-dark))',
        'purple-medium': 'hsl(var(--purple-medium))',
        'purple-light': 'hsl(var(--purple-light))',
        
        'text-primary': 'hsl(var(--text-primary))',
        'text-secondary': 'hsl(var(--text-secondary))',
        'text-muted': 'hsl(var(--text-muted))',
        
        'card-bg': 'hsl(var(--card-bg))',
        'card-bg-hover': 'hsl(var(--card-bg-hover))',
        'surface-glass': 'hsl(var(--surface-glass))',
        'footer-bg': 'hsl(var(--footer-bg))',
        
        'accent-lavender': 'hsl(var(--accent-lavender))',
        'accent-blush': 'hsl(var(--accent-blush))',
        'accent-gold': 'hsl(var(--accent-gold))',
        'accent-cosmic': 'hsl(var(--accent-cosmic))',
        
        'constellation-line': 'hsl(var(--constellation-line))',
        'star-glow': 'hsl(var(--star-glow))',
        'star-color': 'hsl(var(--star-color))',
        'hover-glow': 'hsl(var(--hover-glow))',
        
        // Legacy compatibility
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        'primary': ['var(--font-primary)'],
        'secondary': ['var(--font-secondary)'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        // Constellation Animations
        twinkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(10px, -15px) rotate(2deg)' },
          '50%': { transform: 'translate(-5px, -10px) rotate(-1deg)' },
          '75%': { transform: 'translate(-10px, 5px) rotate(3deg)' },
        },
        'constellation-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        meteor: {
          '0%': { transform: 'translateX(-100px) translateY(-100px)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(100vw) translateY(100vh)', opacity: '0' },
        },
        glow: {
          '0%, 100%': { 
            boxShadow: '0 0 5px hsl(var(--star-glow)), 0 0 10px hsl(var(--star-glow)), 0 0 15px hsl(var(--star-glow))'
          },
          '50%': { 
            boxShadow: '0 0 10px hsl(var(--star-glow)), 0 0 20px hsl(var(--star-glow)), 0 0 30px hsl(var(--star-glow))'
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Constellation Animations
        'twinkle': 'twinkle 3s infinite ease-in-out',
        'float': 'float 8s infinite ease-in-out',
        'constellation-pulse': 'constellation-pulse 4s infinite ease-in-out',
        'meteor': 'meteor 3s linear infinite',
        'glow': 'glow 2s infinite ease-in-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
