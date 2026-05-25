import { Box, Button, Stack, Typography } from '@mui/material';
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * 404 页面 — 替代之前 "* → /timeline" 静默重定向。
 * 让用户清楚知道路径不存在,并提供"返回上一页 / 回到时间轴"两种出口。
 */
function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleBack = () => {
    // history 中如果有上一页就回退,否则去时间轴
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/timeline', { replace: true });
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
        p: { xs: 3, sm: 6 },
        textAlign: 'center',
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '5rem', sm: '7rem' },
          fontWeight: 700,
          color: 'primary.main',
          lineHeight: 1,
          mb: 1,
        }}
      >
        404
      </Typography>

      <Typography variant="h5" sx={{ mb: 1 }}>
        页面走丢了
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 4, maxWidth: 480, wordBreak: 'break-all' }}
      >
        路径{' '}
        <Box
          component="code"
          sx={{
            px: 0.75,
            py: 0.25,
            borderRadius: 0.5,
            bgcolor: 'action.hover',
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            fontSize: '0.875em',
          }}
        >
          {location.pathname}
        </Box>{' '}
        不在已知的页面中,可能是链接已变更或拼写错误。
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          返回上一页
        </Button>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/timeline', { replace: true })}
        >
          回到时间轴
        </Button>
      </Stack>
    </Box>
  );
}

export default NotFoundPage;
