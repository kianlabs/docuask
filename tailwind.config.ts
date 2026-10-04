import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0c0e",
        "ink-card": "#141518",
        "ink-border": "#22242a",
        "ink-hover": "#1a1c20",
      },
    },
  },
  plugins: [],
};

export default config;
