import './TimelineList.css';
import { Dynasty3DWheel, D3Timeline } from './components';
import { Box, Paper } from '@mui/material';

export function TimelineList() {

  return (
    <Paper 
      className="timeline-list-container glass-card animate__animated animate__fadeIn" 
      sx={{ 
        padding: 2, 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        backgroundColor: 'rgba(255, 255, 255, var(--glass-card-bg-opacity, 0.6))', 
        backdropFilter: 'blur(var(--glass-card-blur, 12px))',
        WebkitBackdropFilter: 'blur(var(--glass-card-blur, 12px))',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: 'var(--glass-radius-xl, 24px)',
        boxShadow: 'var(--glass-shadow-md, 0 4px 16px rgba(0, 0, 0, 0.12))'
      }}
    >

      
      {/* 上下布局容器 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 2, overflow: 'hidden' }}>
        {/* 朝代选择区域 - 毛玻璃效果 */}
        <Paper 
          className="glass-card"
          sx={{ 
            padding: 2, 
            overflow: 'hidden', 
            maxHeight: '30vh', 
            backgroundColor: 'rgba(255, 255, 255, 0.5)', 
            backdropFilter: 'blur(var(--glass-blur-light, 12px))',
            WebkitBackdropFilter: 'blur(var(--glass-blur-light, 12px))',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--glass-radius-lg, 16px)',
            boxShadow: 'var(--glass-shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.1))'
          }}
        >
          <Dynasty3DWheel />
        </Paper>
        
        {/* 事件时间轴区域 - 毛玻璃效果 */}
        <Paper 
          className="glass-card"
          sx={{ 
            flex: 1, 
            padding: 2, 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: 'rgba(255, 255, 255, 0.5)', 
            backdropFilter: 'blur(var(--glass-blur-light, 12px))',
            WebkitBackdropFilter: 'blur(var(--glass-blur-light, 12px))',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--glass-radius-lg, 16px)',
            boxShadow: 'var(--glass-shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.1))'
          }}
        >
          <D3Timeline />
        </Paper>
      </Box>
    </Paper>
  );
}