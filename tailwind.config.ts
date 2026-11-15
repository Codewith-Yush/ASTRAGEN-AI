/** @type {import('tailwindcss').Config} */ 
module.exports = {
  darkMode: "class", // ✅ Ensure class-based dark mode
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
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
        // Builder.io Design Tokens (Plan v3)
        canvas: "var(--canvas)",
        surface: {
          DEFAULT: "var(--surface)",
          elevated: "var(--surface-elevated)",
        },
        action: {
          DEFAULT: "var(--action)",
          hover: "var(--action-hover)",
          ink: "var(--action-ink)",
        },
        "accent-cyan": "var(--accent-cyan)",
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
          dim: "var(--ink-dim)",
        },
        border: {
          DEFAULT: "var(--border)",
          subtle: "var(--border-subtle)",
        },
        glow: "var(--glow)",

        input: "var(--border)",
        ring: "var(--action)",
        background: "var(--canvas)",
        foreground: "var(--ink)",
        // Arc.net Design System Core Colors (from design.md)
        arc: {
          blue: "#3B3BFF",       // Electric-blue primary brand
          indigo: "#1A1A8C",     // Deep-indigo secondary & announcement bar
          cream: "#FFFEF0",      // Warm cream testimonial & social proof band
          ink: "#000000",        // Core dark text & code chrome
          white: "#FFFFFF",      // Pure high-contrast white
          muted: "#6B6B8C",      // Muted ink / secondary copy
          slate: "#0A0B14",      // Dark developer slate canvas
          "slate-surface": "#121324", // Dark developer slate card surface
          "slate-border": "#1E2038",  // Dark developer slate border
        },
        primary: {
          DEFAULT: "var(--action)",
          foreground: "var(--action-ink)",
        },
        secondary: {
          DEFAULT: "var(--surface-elevated)",
          foreground: "var(--ink)",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "var(--surface-elevated)",
          foreground: "var(--ink-muted)",
        },
        accent: {
          DEFAULT: "var(--surface-elevated)",
          foreground: "var(--ink)",
        },
        popover: {
          DEFAULT: "var(--surface)",
          foreground: "var(--ink)",
        },
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--ink)",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "Poppins", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "SF Mono", "Menlo", "monospace"],
        display: ["var(--font-display)", "Inter", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem", // Standard Arc component radius
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
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        bounceSlow: {
          "0%, 100%": { 
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)"
          },
          "50%": { 
            transform: "translateY(-10%)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn 0.5s ease-in-out",
        "spin-slow": "spinSlow 16s linear infinite",
        "pulse-slow": "pulseSlow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounceSlow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
