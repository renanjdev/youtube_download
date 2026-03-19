/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#0a0f1c",
        neon: "#00f0ff",
        slate: "#1a2230",
        lavender: "#b3c7ff"
      },
      boxShadow: {
        neon: "0 0 25px rgba(0, 240, 255, 0.4)"
      }
    }
  },
  plugins: []
};
