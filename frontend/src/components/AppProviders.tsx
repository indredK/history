import type { PropsWithChildren } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useMemo } from 'react';
import { useThemeStore } from '@/store';
import { createAppTheme } from '@/theme/createAppTheme';

export function AppProviders({ children }: PropsWithChildren) {
  const { theme } = useThemeStore();
  const muiTheme = useMemo(() => createAppTheme(theme), [theme]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
