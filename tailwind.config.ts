import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        // Stone Gradient Colors
        'stone-black-1': '#0A0A0C',
        'stone-black-2': '#111113',
        'stone-grey-deep': '#18181A',
        'obsidian-soft': '#1D1D21',
        'graphite-matte': '#232326',
        'slate-sheen': '#2A2A2E',
        'smoke-grey': '#333337',
        // Gold Accent Colors
        'gold-accent': '#C8A25F',
        'gold-dim': '#9A804B',
        'gold-glow': 'rgba(200,162,95,0.12)',
        // Text Colors
        'text-primary': '#F2F2F2',
        'text-secondary': '#C9C9C9',
        'text-muted': '#8B8B8B',
        'text-disabled': '#5F5F5F',
        // UI Element Colors
        'border-soft': '#2F2F2F',
        'shadow-soft': 'rgba(0,0,0,0.35)',
        'shadow-card': 'rgba(0,0,0,0.45)',
        'input-bg': '#1A1A1C',
        'hover-surface': '#222225',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        'stone': '0 4px 12px 0 rgba(0,0,0,0.45)',
        'stone-lg': '0 8px 24px 0 rgba(0,0,0,0.45)',
        'stone-xl': '0 12px 32px 0 rgba(0,0,0,0.45)',
        'gold-glow': '0 0 8px rgba(200,162,95,0.12)',
        'gold-glow-md': '0 0 16px rgba(200,162,95,0.12)',
        'gold-glow-lg': '0 0 24px rgba(200,162,95,0.12)',
      },
      backgroundImage: {
        'stone-gradient-dark': 'linear-gradient(to bottom, #111113, #18181A)',
        'stone-gradient-diagonal': 'linear-gradient(135deg, #0A0A0C, #232326)',
        'stone-gradient-card': 'linear-gradient(to bottom, #1D1D21, #111113)',
        'gold-glow': 'linear-gradient(90deg, rgba(200,162,95,0.12), rgba(200,162,95,0.06), rgba(200,162,95,0.12))',
      },
    },
  },
  plugins: [],
};

export default config;