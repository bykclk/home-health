/**
 * Design tokens extracted from the source mockup.
 * React Native StyleSheet does not support oklch(), so the few oklch colors
 * from the design are converted to their sRGB hex equivalents here.
 */

/** Append an alpha channel to a 6-digit hex color (alpha 0..1). */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

export const colors = {
  // Surfaces
  bg: '#f3f2ea',
  surface: '#ffffff',
  frame: '#14160f',
  scrim: 'rgba(44,48,37,0.4)',

  // Text
  text: '#2c3025',
  muted: '#a8a89a',
  muted2: '#7d8071',
  muted3: '#8d9079',
  muted4: '#b3b3a3',

  // Lines / fills
  line: '#ebe9dc',
  line2: '#e6e4d6',
  line3: '#f0eee2',
  line4: '#d9d8c8',
  line5: '#dddccd',
  line6: '#cdd0bc',
  track: '#eceadd',

  // Brand (converted from oklch)
  accent: '#4a754c', // oklch(0.52 0.08 145)
  accentDark: '#456f46', // oklch(0.50 0.08 145)
  onAccent: '#eef2e6',
  danger: '#af5331', // oklch(0.55 0.13 40)

  // Freshness scale for task fill (clean -> due -> overdue)
  fresh: '#4a754c',
  soon: '#b3812f',
  overdue: '#af5331',
} as const;

/** Preset avatar/member colors (used for profiles and the color picker). */
export const avatarColors = ['#4a754c', '#3b6ea5', '#9a5ba6', '#c2792e', '#b3812f', '#5f6b8c'];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const fonts = {
  regular: 'HankenGrotesk_400Regular',
  medium: 'HankenGrotesk_500Medium',
  semibold: 'HankenGrotesk_600SemiBold',
  bold: 'HankenGrotesk_700Bold',
  serif: 'Newsreader_500Medium',
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#2e4628',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;

export const theme = { colors, spacing, radii, fonts, shadow, withAlpha };
export type Theme = typeof theme;
