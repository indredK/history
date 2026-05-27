import { Box, Typography } from '@mui/material';

export function Footer() {
  return (
    <Box component="footer" sx={{ 
      py: 1.25,
      px: 3, 
      mt: 'auto', 
      background: 'linear-gradient(180deg, rgba(18, 15, 13, 0) 0%, rgba(18, 15, 13, 0.72) 100%)',
      borderTop: '1px solid var(--color-border-light)',
      boxShadow: 'none',
      textAlign: 'center',
      transition: 'all var(--transition-normal)'
    }} className="app-footer">
      <Typography variant="caption" align="center" sx={{ 
        fontSize: '0.72rem',
        color: 'var(--color-text-tertiary)',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        transition: 'all var(--transition-normal)',
        display: 'block'
      }}>
        Chinese Historical Panorama Archive Console
      </Typography>
    </Box>
  );
}
