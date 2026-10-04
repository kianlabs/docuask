import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1a7578",
        "on-primary": "#ffffff",
        canvas: "#f7f6f3",
        surface: "#ffffff",
        sunken: "#f0eeea",
        line: "#e3dfda",
        "line-strong": "#d2cec8",
        ink: "#1a1a1e",
        muted: "#64696f",
        accent: {
          DEFAULT: "#1a7578",
          hover: "#146264",
          soft: "#e7f4f4",
          ring: "#a3d5d6",
        },
        positive: { DEFAULT: "#067647", soft: "#ecfdf3" },
        warning: { DEFAULT: "#b54708", soft: "#fffaeb" },
        danger: { DEFAULT: "#b42318", soft: "#fef3f2" },
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        display: ["36px", { lineHeight: "1.1", letterSpacing: "-0.75px" }],
        "heading-1": ["28px", { lineHeight: "1.2", letterSpacing: "-0.5px" }],
        "heading-2": ["22px", { lineHeight: "1.25", letterSpacing: "-0.3px" }],
        "heading-3": ["18px", { lineHeight: "1.3", letterSpacing: "-0.1px" }],
        "body-sm": ["13px", { lineHeight: "1.5" }],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(26,26,30,0.04), 0 1px 3px 0 rgba(26,26,30,0.06)",
        pop: "0 8px 24px -6px rgba(26,26,30,0.14), 0 2px 6px -2px rgba(26,26,30,0.08)",
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
