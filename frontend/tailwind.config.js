/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
        colors: {
          background: "oklch(var(--background) / <alpha-value>)",
          foreground: "oklch(var(--foreground) / <alpha-value>)",
          card: {
            DEFAULT: "oklch(var(--card) / <alpha-value>)",
            foreground: "oklch(var(--card-foreground) / <alpha-value>)",
          },
          popover: {
            DEFAULT: "oklch(var(--popover) / <alpha-value>)",
            foreground: "oklch(var(--popover-foreground) / <alpha-value>)",
          },
          primary: {
            DEFAULT: "oklch(var(--primary) / <alpha-value>)",
            foreground: "oklch(var(--primary-foreground) / <alpha-value>)",
          },
          secondary: {
            DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
            foreground: "oklch(var(--secondary-foreground) / <alpha-value>)",
          },
          muted: {
            DEFAULT: "oklch(var(--muted) / <alpha-value>)",
            foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
          },
          accent: {
            DEFAULT: "oklch(var(--accent) / <alpha-value>)",
            foreground: "oklch(var(--accent-foreground) / <alpha-value>)",
          },
          destructive: {
            DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
            foreground: "oklch(var(--destructive-foreground) / <alpha-value>)",
          },
          border: "oklch(var(--border) / <alpha-value>)",
          input: "oklch(var(--input) / <alpha-value>)",
          ring: "oklch(var(--ring) / <alpha-value>)",
          chart: {
            1: "oklch(var(--chart-1) / <alpha-value>)",
            2: "oklch(var(--chart-2) / <alpha-value>)",
            3: "oklch(var(--chart-3) / <alpha-value>)",
            4: "oklch(var(--chart-4) / <alpha-value>)",
            5: "oklch(var(--chart-5) / <alpha-value>)",
          },
          sidebar: {
            DEFAULT: "oklch(var(--sidebar) / <alpha-value>)",
            foreground: "oklch(var(--sidebar-foreground) / <alpha-value>)",
            primary: "oklch(var(--sidebar-primary) / <alpha-value>)",
            "primary-foreground": "oklch(var(--sidebar-primary-foreground) / <alpha-value>)",
            accent: "oklch(var(--sidebar-accent) / <alpha-value>)",
            "accent-foreground": "oklch(var(--sidebar-accent-foreground) / <alpha-value>)",
            border: "oklch(var(--sidebar-border) / <alpha-value>)",
            ring: "oklch(var(--sidebar-ring) / <alpha-value>)",
          },
      },
      keyframes: {
        "border-blink": {
          "0%, 100%": {
            borderColor: "rgb(129 140 248)",
            boxShadow: "0 0 0 0 rgba(99, 102, 241, 0)",
          },
          "50%": {
            borderColor: "rgb(224 231 255)",
            boxShadow: "0 0 0 4px rgba(99, 102, 241, 0.4)",
          },
        },
      },
      animation: {
        "border-blink": "border-blink 0.55s ease-in-out 5",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}