/**
 * 布局测试页面
 * 用于验证页面不会出现滚动轴的问题
 */

import { Box, Paper, Typography } from '@mui/material';
import { ResponsiveContainer, ResponsiveText } from '@/components';

export function LayoutTestPage() {
  return (
    <ResponsiveContainer>
      <Box sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflow: 'hidden'
      }}>
        <ResponsiveText variant="h1" sx={{ textAlign: 'center', mb: 2 }}>
          布局测试页面
        </ResponsiveText>
        
        <Paper sx={{ 
          flex: 1,
          p: 3,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <Typography variant="h6">测试说明</Typography>
          <Typography variant="body1">
            这个页面用于测试布局是否正确：
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <li>页面本身不应该出现滚动轴</li>
            <li>内容应该在组件内部滚动</li>
            <li>整体布局应该占满视口高度</li>
            <li>不应该超出视口范围</li>
          </Box>
          
          <Typography variant="h6" sx={{ mt: 3 }}>
            长内容测试
          </Typography>
          
          {/* 生成一些长内容来测试滚动 */}
          {Array.from({ length: 50 }, (_, i) => (
            <Typography key={i} variant="body2" sx={{ mb: 1 }}>
              这是第 {i + 1} 行测试内容。这些内容用于测试组件内部的滚动功能是否正常工作。
              页面本身不应该出现滚动轴，所有的滚动都应该在这个Paper组件内部进行。
            </Typography>
          ))}
        </Paper>
      </Box>
    </ResponsiveContainer>
  );
}

export default LayoutTestPage;