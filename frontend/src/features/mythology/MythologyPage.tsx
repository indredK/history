import { Box, Typography, Container } from '@mui/material';

import './MythologyPage.css';

function MythologyPage() {
  return (
    <Container maxWidth="lg">
      <Box className="mythology-page">
        <Typography variant="h4" component="h1" sx={{ 
          mb: 3,
          color: 'var(--color-text-primary)',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          中国神话
        </Typography>
        
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          p: 4
        }}>
          <Typography variant="h6" sx={{ 
            mb: 2,
            color: 'var(--color-text-secondary)'
          }}>
            神话页面
          </Typography>
          <Typography variant="body1" sx={{ 
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
            lineHeight: 1.6
          }}>
            这里将展示中国古代神话故事、神话人物和传说。
            <br />
            页面正在开发中，敬请期待...
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default MythologyPage;