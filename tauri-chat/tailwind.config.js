/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontSize: {
        // base: "var(--font-size-base)"
        base: "16px",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        heading: "hsl(var(--heading))",
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

        // Mocha Pelette
        theme: {
          rosewater: "hsl(var(--theme-rosewater))",
          flamingo: "hsl(var(--theme-flamingo))",
          pink: "hsl(var(--theme-pink))",
          mauve: "hsl(var(--theme-mauve))",
          red: "hsl(var(--theme-red))",
          maroon: "hsl(var(--theme-maroon))",
          peach: "hsl(var(--theme-peach))",
          yellow: "hsl(var(--theme-yellow))",
          green: "hsl(var(--theme-green))",
          teal: "hsl(var(--theme-teal))",
          sky: "hsl(var(--theme-sky))",
          sapphire: "hsl(var(--theme-sapphire))",
          blue: "hsl(var(--theme-blue))",
          lavender: "hsl(var(--theme-lavender))",
          text: "hsl(var(--theme-text))",
          subtext1: "hsl(var(--theme-subtext1))",
          subtext0: "hsl(var(--theme-subtext0))",
          overlay2: "hsl(var(--theme-overlay2))",
          overlay1: "hsl(var(--theme-overlay1))",
          overlay0: "hsl(var(--theme-overlay0))",
          surface2: "hsl(var(--theme-surface2))",
          surface1: "hsl(var(--theme-surface1))",
          surface0: "hsl(var(--theme-surface0))",
          base: "hsl(var(--theme-base))",
          mantle: "hsl(var(--theme-mantle))",
          crust: "hsl(var(--theme-crust))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
};
