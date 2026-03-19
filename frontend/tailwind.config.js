/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#0a0f1c",
        "midnight-light": "#0f1627",
        neon: "#00f0ff",
        "neon-hover": "#4dffff",
        slate: "#1a2230",
        lavender: "#b3c7ff",
        fuchsia: "#d946ef",
        emerald: "#10b981",
        rose: "#f43f5e",
      },
      boxShadow: {
        neon: "0 0 25px rgba(0, 240, 255, 0.4)",
        "neon-hover": "0 0 40px rgba(0, 240, 255, 0.6)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        blob: "blob 7s infinite",
        "blob-reverse": "blob-reverse 10s infinite",
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        "blob-reverse": {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(-30px, 50px) scale(1.1)" },
          "66%": { transform: "translate(20px, -20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
    }
  },
  plugins: []
};
