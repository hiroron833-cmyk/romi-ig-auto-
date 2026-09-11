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
        cream: {
          50: "#FFFBF6",
          100: "#FFF6EC",
          200: "#FDEEDD",
        },
        coral: {
          50: "#FFF1EE",
          100: "#FFE1DB",
          300: "#FFB19E",
          400: "#FF9884",
          500: "#FF7F68",
          600: "#F26150",
        },
        plum: {
          500: "#8C6E97",
          600: "#6E5478",
        },
        ink: {
          500: "#5A4B45",
          700: "#3A2E2A",
          900: "#241C19",
        },
        mint: {
          100: "#E4F5EE",
          400: "#7FC9AC",
          500: "#5FB597",
        },
      },
      boxShadow: {
        soft: "0 8px 24px -8px rgba(58, 46, 42, 0.18)",
        card: "0 2px 12px -2px rgba(58, 46, 42, 0.10)",
      },
      borderRadius: {
        xl2: "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
