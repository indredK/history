import { createTheme, type ThemeOptions } from '@mui/material/styles';
import { borderRadius, colors, spacing, typography } from '@/config/theme';
import { responsiveConfig } from '@/config/responsive';
import type { ThemeMode } from '@/config/themeConfig';

function parsePixelValue(value: string): number {
  return Number.parseInt(value, 10);
}

export function createAppTheme(mode: ThemeMode) {
  const isDark = mode === 'dark';

  const options: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: colors.primary,
        light: colors.primaryLight,
        dark: colors.primaryDark,
      },
      secondary: {
        main: colors.secondary,
        light: colors.secondaryLight,
        dark: colors.secondaryDark,
      },
      background: {
        default: isDark ? '#120f0d' : '#f5efdf',
        paper: isDark ? '#211b16' : '#fffbf3',
      },
      text: {
        primary: isDark ? '#f5ecd8' : '#2c241c',
        secondary: isDark ? '#d2c3a3' : '#57483a',
      },
    },
    shape: {
      borderRadius: parsePixelValue(borderRadius.lg),
    },
    spacing: parsePixelValue(spacing.sm),
    breakpoints: {
      values: {
        xs: responsiveConfig.breakpoints.xs,
        sm: responsiveConfig.breakpoints.sm,
        md: responsiveConfig.breakpoints.md,
        lg: responsiveConfig.breakpoints.lg,
        xl: responsiveConfig.breakpoints.xl,
      },
    },
    typography: {
      fontFamily: typography.fontFamily.base,
      h1: { fontFamily: typography.fontFamily.heading },
      h2: { fontFamily: typography.fontFamily.heading },
      h3: { fontFamily: typography.fontFamily.heading },
      h4: { fontFamily: typography.fontFamily.heading },
      h5: { fontFamily: typography.fontFamily.heading },
      h6: { fontFamily: typography.fontFamily.heading },
      button: {
        fontFamily: typography.fontFamily.base,
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: 'var(--color-bg-gradient)',
            color: 'var(--color-text-primary)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: 'var(--app-panel-bg-strong)',
            color: 'var(--color-text-primary)',
            border: 'var(--app-panel-border)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: 'var(--app-panel-bg-soft)',
            border: 'var(--app-panel-border)',
            boxShadow: 'var(--app-panel-shadow-md)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.lg,
          },
        },
      },
    },
  };

  return createTheme(options);
}
