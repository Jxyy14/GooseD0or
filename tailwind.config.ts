import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",  // 24px mobile
        md: "3rem",         // 48px tablet
        lg: "4rem",         // 64px desktop
      },
      screens: {
        "2xl": "1200px",    // max-w-5xl equivalent
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        "border-hover": "hsl(var(--border-hover))",
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
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        display: ['"Inter Tight"', '"Inter"', "system-ui", "sans-serif"],
        serif: ['"Playfair Display"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      fontSize: {
        // Bold Typography scale
        "xs": ["0.75rem", { lineHeight: "1.5" }],      // 12px
        "sm": ["0.875rem", { lineHeight: "1.5" }],    // 14px
        "base": ["1rem", { lineHeight: "1.6" }],      // 16px
        "lg": ["1.125rem", { lineHeight: "1.6" }],    // 18px
        "xl": ["1.25rem", { lineHeight: "1.5" }],     // 20px
        "2xl": ["1.5rem", { lineHeight: "1.4" }],     // 24px
        "3xl": ["2rem", { lineHeight: "1.25" }],      // 32px
        "4xl": ["2.5rem", { lineHeight: "1.1" }],     // 40px
        "5xl": ["3.5rem", { lineHeight: "1.1" }],     // 56px
        "6xl": ["4.5rem", { lineHeight: "1" }],       // 72px
        "7xl": ["6rem", { lineHeight: "1" }],         // 96px
        "8xl": ["8rem", { lineHeight: "1" }],         // 128px
        "9xl": ["10rem", { lineHeight: "1" }],        // 160px
      },
      letterSpacing: {
        tighter: "-0.06em",
        tight: "-0.04em",
        normal: "-0.01em",
        wide: "0.05em",
        wider: "0.1em",
        widest: "0.2em",
      },
      lineHeight: {
        none: "1",
        tight: "1.1",
        snug: "1.25",
        normal: "1.6",
        relaxed: "1.75",
      },
      borderRadius: {
        // Sharp edges - no radius anywhere
        lg: "0px",
        md: "0px",
        sm: "0px",
        DEFAULT: "0px",
        none: "0px",
      },
      transitionTimingFunction: {
        "bold": "cubic-bezier(0.25, 0, 0, 1)", // fast-out, crisp stop
      },
      transitionDuration: {
        "150": "150ms",
        "200": "200ms",
        "500": "500ms",
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
        "underline-grow": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
