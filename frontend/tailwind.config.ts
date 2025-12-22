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
        border: 'var(--border)',
        link: {
          DEFAULT: 'var(--link)',
          hover: 'var(--linkHover)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
        },
        secondary: 'var(--text-secondary)',
        cyan: 'var(--cyan)',
        magenta: 'var(--magenta)',
        purple: 'var(--purple)',
        success: 'var(--success)',
        warn: 'var(--warn)',
        danger: 'var(--danger)',
        info: 'var(--info)',
      },
    },
  },
  plugins: [],
};

export default config;
