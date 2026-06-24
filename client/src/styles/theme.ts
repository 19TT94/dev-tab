const slate = '#f8fafc'; // #f8fafc
const black = '#101216'; // #101216
const white = '#f7faff'; // #f7faff
const green = '#02c39a'; // #02c39a
const red = '#f24333'; // #f24333
const turquiose = '#40e0d0'; // #40e0d0
const gold = 'rgb(238, 232, 170)';
const blueGray = '#64748b'; // #64748b
const lightGray = '#dde4ee'; // #dde4ee

export const theme = {
  colors: {
    background: slate,
    primary: turquiose,
    secondary: black,
    tertiary: white,
    muted: blueGray,
    border: lightGray,
    success: green,
    danger: red,
    accent: gold,
  },
  fonts: {
    body: 'system-ui, -apple-system, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '5xl': '3rem',
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  radii: {
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
  },
} as const

export type AppTheme = typeof theme
