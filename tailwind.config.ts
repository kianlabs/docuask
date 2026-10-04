import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light, "workspace" palette (Linear/Notion flavour).
        canvas: "#f7f7f8", // page background
        surface: "#ffffff", // cards, panels
        sunken: "#f1f2f4", // inset areas (inputs, code)
        line: "#e6e7eb", // default border
        "line-strong": "#d5d7dd", // emphasised border
        ink: "#17181c", // primary text
        muted: "#63676f", // secondary text
        faint: "#9aa0a9", // tertiary text / hints
        accent: {
          DEFAULT: "#4f46e5", // indigo-600
          hover: "#4338ca", // indigo-700
          soft: "#eef0ff", // tinted background
          ring: "#c7c9f7",
        },
        positive: { DEFAULT: "#067647", soft: "#ecfdf3" },
        warning: { DEFAULT: "#b54708", soft: "#fffaeb" },
        danger: { DEFAULT: "#b42318", soft: "#fef3f2" },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Inter",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(16 24 40 / 0.04), 0 1px 3px 0 rgb(16 24 40 / 0.06)",
        pop: "0 8px 24px -6px rgb(16 24 40 / 0.14), 0 2px 6px -2px rgb(16 24 40 / 0.08)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 80%, 100%": { opacity: "0.25" },
          "40%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.18s ease-out both",
        blink: "blink 1.2s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
