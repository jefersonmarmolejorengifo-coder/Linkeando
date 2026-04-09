import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        verde: {
          50:  "#edf8f4",
          100: "#d0ede4",
          200: "#a3daca",
          300: "#6dc4ad",
          400: "#3aaa8d",
          500: "#1D9E75",
          600: "#17825f",
          700: "#12664b",
          800: "#0d4c38",
          900: "#093326",
        },
      },
    },
  },
  plugins: [],
};
export default config;
