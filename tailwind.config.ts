import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontSize: {
      'xs':   ['11px', { lineHeight: '1.4', letterSpacing: '0.01em' }],
      'sm':   ['13px', { lineHeight: '1.5' }],
      'base': ['15px', { lineHeight: '1.6' }],
      'lg':   ['18px', { lineHeight: '1.5' }],
      'xl':   ['24px', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
      '2xl':  ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
    },
    borderRadius: {
      'none': '0',
      'sm': '2px',
      'DEFAULT': '4px',
      'md': '6px',
      'lg': '8px',
      'xl': '12px',
      'full': '9999px',
    },
    extend: {
      colors: {
        // Base surfaces (warm ivory — NEVER cold white)
        'bg-base':            '#F5F0E8',
        'surface-primary':    '#EDE8DF',
        'surface-elevated':   '#E8E2D8',
        'surface-low':        '#F8F3EB',
        'surface':            '#F2EDE5',
        'surface-high':       '#ECE8E0',
        'surface-highest':    '#E7E2DA',

        // Borders
        'border-subtle':      '#D8D2C8',
        'border-medium':      '#C4BDB0',
        'outline':            '#807571',
        'outline-variant':    '#D1C4BF',

        // Text
        'text-primary':       '#1A1714',
        'text-secondary':     '#6B6560',
        'text-tertiary':      '#9B9590',

        // Accents
        'accent-espresso':    '#2D2522',
        'accent-violet':      '#6B5CE7',
        'accent-amber':       '#D4853A',
        'accent-teal':        '#3A8A82',
        'accent-rose':        '#C4626A',

        // Graph (dark canvas — only dark screen)
        'graph-bg':           '#0F0D0B',
        'graph-surface':      '#1A1714',

        // TARS panel (always dark)
        'tars-bg':            '#1A1714',
        'tars-surface':       '#2D2826',
        'tars-border':        '#4E4542',

        // Note type colors
        'type-study':         '#5B8DD9',
        'type-problem':       '#D4853A',
        'type-sysdesign':     '#7B5CE7',
        'type-diagram':       '#3A8A82',
        'type-canvas':        '#C4626A',
        'type-daily':         '#9B9590',
        'type-capture':       '#C4BDB0',

        // Status
        'status-online':      '#4CAF50',
        'status-syncing':     '#FB8C00',
        'status-offline':     '#9B9590',
      },
      fontFamily: {
        ui:    ['Inter', 'system-ui', 'sans-serif'],
        prose: ['Inter', 'system-ui', 'sans-serif'],
        label: ['Inter', 'system-ui', 'sans-serif'],
        code:  ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '40px',
        'xxl': '64px',
      },
      boxShadow: {
        'modal': '0 24px 80px rgba(26,23,20,0.25)',
      },
      transitionDuration: {
        'enter': '80ms',
        'exit': '200ms',
        'state': '120ms',
      },
      transitionTimingFunction: {
        'enter': 'ease-out',
        'exit': 'ease-in-out',
        'state': 'ease-out',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
        'slide-in-right': 'slide-in-right 80ms ease-out',
        'slide-in-left': 'slide-in-left 80ms ease-out',
        'slide-up': 'slide-up 80ms ease-out',
        'fade-in': 'fade-in 120ms ease-out',
      },
    },
  },
  plugins: [],
}

export default config
