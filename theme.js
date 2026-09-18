// theme.js
// Design tokens for the admin UI (JavaScript / MUI — no TypeScript).
// Governed by CONSTITUTION.md — do not add ad-hoc colors/spacing outside
// this file; extend the token set here instead.
// Note: this is a JS port of the same tokens used on the player-side
// (MERN/TS) app's theme.ts. Keep both in sync if either changes — they
// should represent ONE visual language across both phases.

import { alpha, createTheme } from '@mui/material/styles';

// ---------------------------------------------------------------------------
// 1. Color tokens
// ---------------------------------------------------------------------------
// One restrained neutral base per mode + one accent, used sparingly.
// Accent is reserved for: primary actions, key figures (balances, credit
// grants, withdrawal amounts), and status/hero content. Everything else
// stays quiet.

const accent = {
  main: '#2F6F5E',      // deep desaturated teal-green — controlled, not a default fintech blue
  light: '#5B9585',
  dark: '#204E41',
  contrastText: '#FFFFFF',
};

const light = {
  mode: 'light',
  background: {
    default: '#F6F7F8',   // near-white, not pure white
    paper: '#FFFFFF',
  },
  text: {
    primary: '#161A1D',    // near-black, not pure black
    secondary: '#5B6470',
  },
  divider: '#E3E6E9',
  success: { main: '#2E8B57' },
  warning: { main: '#C98A1B' },
  error: { main: '#C0392B' },
};

const dark = {
  mode: 'dark',
  background: {
    default: '#14171A',   // near-black, not pure #000
    paper: '#1C2024',
  },
  text: {
    primary: '#EDEFF1',
    secondary: '#9AA3AD',
  },
  divider: '#2A2F34',
  success: { main: '#3FA96D' },
  warning: { main: '#D89A2E' },
  error: { main: '#D9564A' },
};

// ---------------------------------------------------------------------------
// 2. Spacing — 4px base instead of MUI's 8px default
// ---------------------------------------------------------------------------
const SPACING_UNIT = 4;

// ---------------------------------------------------------------------------
// 3. Shape — single deliberate radius scale
// ---------------------------------------------------------------------------
const RADIUS = {
  sm: 4,
  md: 8,
};

// ---------------------------------------------------------------------------
// 4. Typography
// ---------------------------------------------------------------------------
// UI face: Manrope (geometric-but-warm grotesque, tighter than Inter).
// Numeric face: Space Grotesk (distinct from Manrope, true tabular figures —
// use for balances, credit amounts, IDs/codes in tables).
// Neither covers Ethiopic script, so Amharic text falls back to Noto Sans
// Ethiopic — this fallback is REQUIRED, not optional, since Manrope/Space
// Grotesk glyphs simply don't exist for Ge'ez script and the browser will
// silently substitute an ugly system fallback without it.
// All three fonts must be loaded (e.g. via @fontsource or a <link> to
// Google Fonts) before referencing them here.
const fontUI = "'Manrope', 'Noto Sans Ethiopic', -apple-system, 'Segoe UI', sans-serif";
const fontNumeric = "'Space Grotesk', 'Noto Sans Ethiopic', 'Roboto Mono', monospace";

const typography = {
  fontFamily: fontUI,
  h1: { fontFamily: fontUI, fontWeight: 700, fontSize: '2rem', lineHeight: 1.2 },
  h2: { fontFamily: fontUI, fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.25 },
  h3: { fontFamily: fontUI, fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.3 },
  h4: { fontFamily: fontUI, fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
  h5: { fontFamily: fontUI, fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 },
  h6: { fontFamily: fontUI, fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.5 },
  subtitle1: { fontFamily: fontUI, fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.5 },
  subtitle2: { fontFamily: fontUI, fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.5 },
  caption: { fontFamily: fontUI, fontWeight: 500, fontSize: '0.75rem', lineHeight: 1.5 },
  body1: { fontFamily: fontUI, fontWeight: 400, fontSize: '0.9375rem', lineHeight: 1.5 },
  body2: { fontFamily: fontUI, fontWeight: 400, fontSize: '0.8125rem', lineHeight: 1.5 },
  button: { fontFamily: fontUI, fontWeight: 600, textTransform: 'none' }, // no ALL-CAPS buttons
};

// Use this for balances, credit amounts, table numeric columns:
// <Typography sx={{ fontFamily: numericFontFamily }}>1,240 Birr</Typography>
export const numericFontFamily = fontNumeric;

// ---------------------------------------------------------------------------
// 5. Component overrides — kills the default MUI "rounded card + soft shadow"
//    look app-wide, from one place.
// ---------------------------------------------------------------------------
function buildComponents(mode) {
  const palette = mode === 'light' ? light : dark;
  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: palette.background.default },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // kill MUI's default elevation gradient overlay
          borderRadius: RADIUS.md,
        },
      },
      defaultProps: { elevation: 0 },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.md,
          border: `1px solid ${palette.divider}`,
          boxShadow: 'none', // hairline border instead of soft grey shadow
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.sm,
          boxShadow: 'none',
          padding: `${SPACING_UNIT * 2}px ${SPACING_UNIT * 4}px`,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: RADIUS.sm },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'default' },
      styleOverrides: {
        root: { backgroundColor: palette.background.paper, color: palette.text.primary, borderBottom: `1px solid ${palette.divider}` },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: { '&.Mui-focusVisible': { outline: `2px solid ${mode === 'dark' ? accent.light : accent.main}`, outlineOffset: 2 } },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundImage: 'none',
          backgroundColor: palette.background.paper,
          borderRadius: RADIUS.md,
          border: `1px solid ${palette.divider}`,
          boxShadow: theme.elevation.dialog,
          margin: SPACING_UNIT * 6,
          maxHeight: `calc(100% - ${SPACING_UNIT * 12}px)`,
          [theme.breakpoints.down('sm')]: {
            margin: SPACING_UNIT * 3,
            maxWidth: `calc(100% - ${SPACING_UNIT * 6}px)`,
            maxHeight: `calc(100% - ${SPACING_UNIT * 6}px)`,
          },
          '&.MuiDialog-paperFullWidth': {
            width: `calc(100% - ${SPACING_UNIT * 12}px)`,
            [theme.breakpoints.down('sm')]: {
              width: `calc(100% - ${SPACING_UNIT * 6}px)`,
            },
          },
          '&.MuiDialog-paperFullScreen': {
            margin: 0,
            width: '100%',
            maxWidth: '100%',
            height: '100%',
            maxHeight: 'none',
            border: 0,
            borderRadius: 0,
          },
        }),
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: `${SPACING_UNIT * 4}px ${SPACING_UNIT * 5}px`,
          fontSize: typography.h4.fontSize,
          fontWeight: 600,
          lineHeight: typography.h4.lineHeight,
          color: palette.text.primary,
          borderBottom: `1px solid ${palette.divider}`,
          overflowWrap: 'anywhere',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: `${SPACING_UNIT * 5}px`,
          color: palette.text.primary,
          overflowWrap: 'anywhere',
          '.MuiDialogTitle-root + &': { paddingTop: SPACING_UNIT * 5 },
        },
        dividers: { borderColor: palette.divider, borderTop: 0, borderBottom: 0 },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: `${SPACING_UNIT * 3}px ${SPACING_UNIT * 5}px`,
          gap: SPACING_UNIT * 2,
          flexWrap: 'wrap',
          backgroundColor: palette.background.default,
          borderTop: `1px solid ${palette.divider}`,
          '& > .MuiButton-root': { minHeight: SPACING_UNIT * 10 },
        },
        spacing: { '& > :not(:first-of-type)': { marginLeft: 0 } },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? 'rgba(10, 12, 14, 0.66)' : 'rgba(22, 26, 29, 0.42)',
          '&.MuiBackdrop-invisible': { backgroundColor: 'transparent' },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.sm,
          backgroundColor: palette.background.paper,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: palette.divider },
          '&:hover:not(.Mui-disabled):not(.Mui-error) .MuiOutlinedInput-notchedOutline': { borderColor: palette.text.secondary },
          '&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
            borderWidth: 2,
            borderColor: mode === 'dark' ? accent.light : accent.main,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: palette.error.main },
          '&.Mui-disabled': { backgroundColor: palette.background.default },
        },
      },
    },
    MuiFormControl: {
      defaultProps: { size: 'small' },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: { color: palette.text.secondary },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { marginLeft: SPACING_UNIT, fontSize: typography.caption.fontSize },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: palette.divider,
          padding: `${SPACING_UNIT * 3}px ${SPACING_UNIT * 4}px`,
          fontSize: typography.body2.fontSize,
        },
        head: { backgroundColor: palette.background.default, color: palette.text.secondary, fontWeight: 600 },
      },
    },
  };
}

// ---------------------------------------------------------------------------
// 6. Theme factory — call getAppTheme('light' | 'dark')
// ---------------------------------------------------------------------------
export function getAppTheme(mode) {
  const palette = mode === 'light' ? light : dark;

  return createTheme({
    palette: {
      mode,
      primary: mode === 'dark' ? { ...accent, main: accent.light } : accent,
      secondary: { main: palette.text.secondary },
      background: palette.background,
      text: palette.text,
      divider: palette.divider,
      success: palette.success,
      warning: palette.warning,
      error: palette.error,
      surface: {
        subtle: mode === 'dark' ? '#191D21' : '#F0F2F4',
        selected: alpha(mode === 'dark' ? accent.light : accent.main, mode === 'dark' ? 0.16 : 0.08),
        selectedHover: alpha(mode === 'dark' ? accent.light : accent.main, mode === 'dark' ? 0.22 : 0.12),
      },
    },
    elevation: {
      dialog: mode === 'dark'
        ? '0 12px 32px rgba(0, 0, 0, 0.32)'
        : '0 12px 32px rgba(22, 26, 29, 0.12)',
    },
    layout: {
      drawerWidth: 240,
      topbarHeight: 56,
      navItemHeight: 40,
      touchTargetSize: 44,
      navIconSize: 20,
      brandSize: 32,
      avatarSize: 36,
      statusIconSize: 8,
      navIndicatorWidth: 3,
      navIndicatorRadius: `0 ${RADIUS.sm}px ${RADIUS.sm}px 0`,
      focusWidth: 2,
    },
    spacing: SPACING_UNIT,
    shape: { borderRadius: RADIUS.sm },
    typography,
    components: buildComponents(mode),
  });
}

// ---------------------------------------------------------------------------
// Notes:
// - Wire getAppTheme(mode) into a ThemeProvider at the app root, with `mode`
//   coming from a toggle stored in context/localStorage. Do not build a
//   second theming mechanism alongside MUI's — extend this file only.
// - Load Manrope, Space Grotesk, and Noto Sans Ethiopic (e.g. via
//   @fontsource/manrope, @fontsource/space-grotesk, @fontsource/noto-sans-ethiopic,
//   or Google Fonts <link> tags) before this theme is used, or text will fall
//   back to system fonts silently.
// - For Amharic body copy, consider slightly increased line-height —
//   Ethiopic script has different vertical rhythm than Latin and can feel
//   cramped at Latin-tuned line-heights.
// - accent.main (#2F6F5E) is a considered starting point, not locked in —
//   but keep it to ONE accent used sparingly per Section 3 of the
//   constitution if you do change it.
// - Added MuiTableCell override vs the player-side theme, since the admin
//   UI leans heavily on data tables (shop lists, user lists, withdrawal
//   queues) that the gameplay UI doesn't have — keep this addition here
//   only, don't backport it unless the player side grows real tables too.
// ---------------------------------------------------------------------------