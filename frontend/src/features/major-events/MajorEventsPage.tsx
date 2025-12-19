import { Box, Typography, Container } from '@mui/material';

import './MajorEventsPage.css';

function MajorEventsPage() {
  return (
    <Container maxWidth="lg">
      <Box className="major-events-page">
        <Typography variant="h4" component="h1" sx={{ 
          mb: 3,
          color: 'var(--color-text-primary)',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          重大事件
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
            重大事件页面
          </Typography>
          <Typography variant="body1" sx={{ 
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
            lineHeight: 1.6
          }}>
            这里将展示中国历史上的重大事件、重要战争、政治变革等。
            <br />
            与时间轴不同，这里将按主题分类展示具有重大影响的历史事件。
            <br />
            页面正在开发中，敬请期待...
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default MajorEventsPage;