import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#030408",
        panel: "rgba(9, 12, 22, 0.45)",
        line: "rgba(255, 255, 255, 0.08)",
        accent: "#0ea5e9",
        accent2: "#6366f1",
        turf: "#10b981",
        amber: "#f59e0b",
        warn: "#f59e0b",
        danger: "#ef4444",
      },
      backdropBlur: { xs: "2px" },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
