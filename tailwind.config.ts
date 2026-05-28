import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        // shadcn/ui tokens — keep intact
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
        // Aurora design system — additive, prefix: aurora-*
        aurora: {
          primary: {
            50: "#F3F1FE",
            100: "#E0DDFC",
            300: "#A29BFE",
            500: "#6C5CE7",
            700: "#4834D4",
            900: "#26215C",
          },
          accent: {
            50: "#E0FAF9",
            300: "#81ECEC",
            500: "#00CEC9",
            700: "#0A6B68",
            900: "#04342C",
          },
          gold: {
            50: "#FFF8E7",
            300: "#FFEAA7",
            500: "#FDCB6E",
            600: "#E17055",
            900: "#8B6914",
          },
          streak: {
            50: "#FFE8E8",
            500: "#FF6B6B",
            600: "#EB4D4B",
            900: "#501313",
          },
          // Surface tokens — reference CSS variables for theme-awareness
          "bg-deepest": "var(--aurora-bg-deepest)",
          "bg-card": "var(--aurora-bg-card)",
          "bg-elevated": "var(--aurora-bg-elevated)",
          "bg-interactive": "var(--aurora-bg-interactive)",
          "border-subtle": "var(--aurora-border-subtle)",
          "border-medium": "var(--aurora-border-medium)",
          "border-strong": "var(--aurora-border-strong)",
          "text-primary": "var(--aurora-text-primary)",
          "text-secondary": "var(--aurora-text-secondary)",
          "text-tertiary": "var(--aurora-text-tertiary)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...fontFamily.mono],
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
        gradient: {
          to: { backgroundPosition: "var(--bg-size, 300%) 0" },
        },
        shine: {
          "0%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "100% 100%" },
          "100%": { backgroundPosition: "0% 0%" },
        },
        meteor: {
          "0%": { transform: "rotate(var(--angle)) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": { transform: "rotate(var(--angle)) translateX(-500px)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        gradient: "gradient 8s linear infinite",
        shine: "shine var(--duration) infinite linear",
        meteor: "meteor 5s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;
