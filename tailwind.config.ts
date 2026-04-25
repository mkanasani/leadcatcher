import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#04060d",
          900: "#080b16",
          800: "#0d1220",
          700: "#161c2e",
        },
        glow: {
          cyan: "#22d3ee",
          violet: "#a855f7",
          magenta: "#ec4899",
          lime: "#a3e635",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "border-spin": "border-spin 7s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", filter: "blur(20px)" },
          "50%": { opacity: "1", filter: "blur(28px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "border-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(circle at 50% 0%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(circle at 80% 80%, rgba(34,211,238,0.14), transparent 50%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
