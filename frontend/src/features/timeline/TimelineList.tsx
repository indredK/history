import './TimelineList.css';
import { Dynasty3DWheel, D3Timeline } from './components';
import { Box, Paper } from '@mui/material';

export function TimelineList() {

  return (
    <Paper className="timeline-list-container animate__animated animate__fadeIn" sx={{ padding: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0)', backdropFilter: 'blur(10px)', boxShadow: 'none' }}>

      
      {/* 上下布局容器 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 2, overflow: 'hidden' }}>
        {/* 朝代选择区域 */}
        <Paper sx={{ padding: 2, overflow: 'hidden', maxHeight: '30vh', backgroundColor: 'rgba(255, 255, 255, 0)', backdropFilter: 'blur(10px)', boxShadow: 'none' }}>
          <Dynasty3DWheel />
        </Paper>
        
        {/* 事件时间轴区域 */}
        <Paper sx={{ flex: 1, padding: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255, 255, 255, 0)', backdropFilter: 'blur(10px)', boxShadow: 'none' }}>
          <D3Timeline />
        </Paper>
      </Box>
    </Paper>
  );
}