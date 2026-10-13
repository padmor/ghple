import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
        /* ── GBHPL Brand Palette: Deep Forest & Gold ── */
        brand: {
          forest:       "#1A3320",   /* deep forest green – primary dark */
          "forest-mid": "#2A4F32",   /* mid forest – cards, navbar */
          "forest-light":"#3D6647",  /* lighter green – hover states */
          gold:         "#D4A017",   /* palm gold – primary CTA */
          "gold-light":  "#E8B830",  /* lighter gold – hover */
          "gold-deep":   "#A07A10",  /* dark gold – pressed state */
          ivory:        "#FFF8F0",   /* warm ivory – light backgrounds */
          "ivory-dark":  "#F5EDE0",  /* slightly darker ivory – card bg */
          terracotta:   "#C65D2A",   /* terracotta – badge, alert accent */
          sage:         "#7A9E6E",   /* sage green – subtle icons/borders */
          charcoal:     "#1C1C1E",   /* near-black – body text */
          mist:         "#F0F4F1",   /* very light green-white – subtle bg */
          /* Manager panel colours */
          navy:         "#0D1B2A",   /* midnight navy – manager bg */
          "navy-mid":   "#1A2E42",   /* manager card bg */
          "navy-light":  "#243D55",  /* manager hover */
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      keyframes: {
        loadbar: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-left": {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "sheet-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "drawer-in": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "drawer-out": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        "mobile-menu-in": {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "fade-in-left": "fade-in-left 0.4s ease-out",
        "slide-down": "slide-down 0.25s ease-out",
        "scale-in": "scale-in 0.25s ease-out",
        "sheet-up": "sheet-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        shimmer: "shimmer 2.5s linear infinite",
        "drawer-in": "drawer-in 0.3s ease-out",
        "drawer-out": "drawer-out 0.3s ease-in",
        "mobile-menu-in": "mobile-menu-in 0.2s ease-out",
      },
      boxShadow: {
        "gold-sm": "0 2px 8px rgba(212,160,23,0.25)",
        "gold-md": "0 4px 20px rgba(212,160,23,0.35)",
        "forest-sm": "0 2px 8px rgba(26,51,32,0.2)",
        "forest-md": "0 8px 32px rgba(26,51,32,0.25)",
        card: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
