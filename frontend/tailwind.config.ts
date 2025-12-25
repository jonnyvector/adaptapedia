import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg)',
        foreground: 'var(--text)',
        surface: 'var(--surface)',
        surface2: 'var(--surface2)',
        muted: 'var(--muted)',
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        link: {
          DEFAULT: 'var(--link)',
          hover: 'var(--linkHover)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          light: 'var(--primary-light)',
        },
        secondary: 'var(--text-secondary)',
        // Accent colors for semantic use
        'accent-blue': {
          DEFAULT: 'var(--accent-blue)',
          hover: 'var(--accent-blue-hover)',
          light: 'var(--accent-blue-light)',
        },
        'accent-violet': 'var(--accent-violet)',
        'accent-emerald': 'var(--accent-emerald)',
        'accent-amber': 'var(--accent-amber)',
        'accent-rose': 'var(--accent-rose)',
      },
      spacing: {
        '18': '4.5rem',
      },
      transitionDuration: {
        '200': '200ms',
      },
    },
  },
  plugins: [],
};

export default config;
