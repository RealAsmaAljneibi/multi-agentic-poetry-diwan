import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['"Amiri"', '"Scheherazade New"', 'serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Heritage / manuscript palette
        parchment: {
          50: '#FDF9F0',
          100: '#F8EFD9',
          200: '#EFE0BC',
          300: '#E2CB95',
          400: '#D2B373',
        },
        ink: {
          50: '#5C4A38',
          100: '#4A3825',
          200: '#3B2A18',
          300: '#2C1F11',
          400: '#1A120A',
        },
        gold: {
          400: '#C39A3D',
          500: '#A8821F',
          600: '#8C6A18',
        },
        crimson: {
          500: '#8B2A24',
          600: '#6E211C',
        },
        sage: {
          500: '#5B6B4D',
          600: '#46553B',
        },
      },
      backgroundImage: {
        'arabesque': "radial-gradient(circle at 20% 20%, rgba(195,154,61,0.08) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(139,42,36,0.06) 0%, transparent 40%)",
      },
    },
  },
  plugins: [],
};
export default config;
