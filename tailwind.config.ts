import type { Config } from 'tailwindcss';
import scrollbarHide from 'tailwind-scrollbar-hide';

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#363C83',
        'brand-input-text': '#000000',
        'brand-success': '#28a745',
        'brand-error': '#ef4444',
        'brand-input-placeholder': '#a1a1aa',
      },
      fontFamily: {
        'nvn': 'var(--font-nvn-motherland)',
        'times': ['Times New Roman', 'Times', 'serif'],
        'comic': 'var(--font-vnf-comic-sans)',
      },
    },
  },
  plugins: [
    scrollbarHide,
  ],
};

export default config; 