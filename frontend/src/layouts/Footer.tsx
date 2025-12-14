import { Box, Typography } from '@mui/material';

export function Footer() {
  return (
    <Box component="footer" sx={{ 
      py: 1, 
      px: 3, 
      mt: 'auto', 
      background: 'linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%)',
      borderTop: '1px solid var(--color-border-medium)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
      textAlign: 'center',
      transition: 'all var(--transition-normal)'
    }} className="app-footer">
      <Typography variant="caption" align="center" sx={{ 
        fontSize: '0.7rem',
        color: 'var(--color-text-tertiary)',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        transition: 'all var(--transition-normal)',
        display: 'block'
      }}>
        © 2025 中国历史全景 | Chinese Historical Panorama | MIT License
      </Typography>
    </Box>
  );
}
