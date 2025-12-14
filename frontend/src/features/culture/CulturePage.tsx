import { Box, Typography } from '@mui/material';
import './CulturePage.css';

export function CulturePage() {
  return (
    <Box className="culture-page">
      <Typography variant="h4" component="h1" sx={{
        mb: 3,
        color: 'var(--color-text-primary)',
        fontWeight: 'bold'
      }}>
        文化页面
      </Typography>
      <Typography variant="body1" sx={{
        color: 'var(--color-text-secondary)'
      }}>
        这是一个空白的文化页面，后续可以在这里添加文化相关的内容。
      </Typography>
    </Box>
  );
}