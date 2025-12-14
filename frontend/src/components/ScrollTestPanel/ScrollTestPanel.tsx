import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, FormControlLabel, Checkbox } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

/**
 * 滚动测试面板组件
 * 用于测试功能面板的滚动效果
 */
export function ScrollTestPanel() {
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-text-primary)' }}>
        滚动测试面板
      </Typography>
      
      {/* 生成多个测试项目来触发滚动 */}
      {Array.from({ length: 8 }, (_, index) => (
        <Accordion 
          key={index}
          sx={{ 
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-lg) !important',
            '&:before': { display: 'none' },
            mb: 1
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="body2">测试项目 {index + 1}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={<Checkbox size="small" />}
                label={<Typography variant="body2">选项 A</Typography>}
              />
              <FormControlLabel
                control={<Checkbox size="small" />}
                label={<Typography variant="body2">选项 B</Typography>}
              />
              <FormControlLabel
                control={<Checkbox size="small" />}
                label={<Typography variant="body2">选项 C</Typography>}
              />
              <Typography variant="caption" sx={{ color: 'var(--color-text-tertiary)', mt: 1 }}>
                这是测试项目 {index + 1} 的详细描述。用于测试滚动功能是否正常工作。
                当内容超出容器高度时，应该出现自定义的滚动条和渐变遮罩效果。
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
      
      <Box sx={{ mt: 2, p: 2, backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
          滚动测试说明：
        </Typography>
        <Typography variant="caption" sx={{ color: 'var(--color-text-tertiary)', display: 'block', mt: 1 }}>
          • 当内容超出容器高度时，会显示自定义滚动条
        </Typography>
        <Typography variant="caption" sx={{ color: 'var(--color-text-tertiary)', display: 'block' }}>
          • 滚动条具有炫酷的多彩流光效果
        </Typography>
        <Typography variant="caption" sx={{ color: 'var(--color-text-tertiary)', display: 'block' }}>
          • 顶部和底部会显示渐变遮罩效果
        </Typography>
        <Typography variant="caption" sx={{ color: 'var(--color-text-tertiary)', display: 'block' }}>
          • 切换标签时会自动滚动到顶部
        </Typography>
      </Box>
    </Box>
  );
}