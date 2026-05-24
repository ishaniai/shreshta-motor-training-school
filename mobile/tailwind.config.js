/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        asphalt: {
          950: "#0B1220",
          900: "#111827",
          800: "#1F2937",
          700: "#374151",
        },
        signal: {
          green: "#22C55E",
          red: "#EF4444",
          amber: "#F59E0B",
        },
        accent: {
          road: "#38BDF8",
          chrome: "#E5E7EB",
        },
      },
    },
  },
  plugins: [],
};
