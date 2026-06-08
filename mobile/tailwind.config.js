/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Legacy tokens kept for backward-compat
        asphalt: {
          950: "#030712",
          900: "#060D1F",
          800: "#0D1A35",
          700: "#1E3254",
        },
        signal: {
          green: "#22C55E",
          red: "#EF4444",
          amber: "#F59E0B",
        },
        accent: {
          road: "#38BDF8",
          chrome: "#CBD5E1",
        },

        // Premium dark palette
        midnight: {
          950: "#030712",
          900: "#060D1F",
          800: "#0D1A35",
          700: "#152847",
          600: "#1E3254",
        },
        neon: {
          blue:  "#38BDF8",
          cyan:  "#22D3EE",
          gold:  "#F59E0B",
          mint:  "#34D399",
        },
        glass: {
          white: "rgba(255,255,255,0.07)",
          border: "rgba(255,255,255,0.13)",
          dark:  "rgba(0,0,0,0.35)",
        },

        // Premium light palette
        sky: {
          50:  "#F0F7FF",
          100: "#E1EFFF",
          200: "#C3DFFF",
          800: "#1D4ED8",
          900: "#1E3A8A",
        },
      },
      backdropBlur: {
        xs: "2px",
        glass: "16px",
      },
      boxShadow: {
        glass:  "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
        neon:   "0 0 24px rgba(56,189,248,0.4), 0 0 48px rgba(56,189,248,0.15)",
        "neon-gold": "0 0 20px rgba(245,158,11,0.5)",
        glow:   "0 4px 24px rgba(56,189,248,0.25)",
      },
    },
  },
  plugins: [],
};
