/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          indigo: "#6366F1",
          violet: "#8B5CF6",
          cyan: "#06B6D4",
          emerald: "#10B981"
        }
      },
      boxShadow: {
        glow: "0 18px 70px rgba(99, 102, 241, 0.22)"
      }
    }
  },
  plugins: []
};
