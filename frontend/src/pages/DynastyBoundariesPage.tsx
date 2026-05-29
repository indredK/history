import { useState } from 'react';
import { DynastyBoundaryMap, DYNASTIES } from '@/features/map/components';
import { Box, Typography, Paper } from '@mui/material';

function DynastyBoundariesPage() {
  const [selectedDynastyId, setSelectedDynastyId] = useState<string>('qin');

  const selectedDynasty = DYNASTIES.find((d) => d.id === selectedDynastyId);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2,
        boxSizing: 'border-box',
      }}
    >
      {/* 页面标题 */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          background: 'var(--app-panel-bg, rgba(255,255,255,0.8))',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--theme-glass-border, rgba(0,0,0,0.1))',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold' }} gutterBottom>
          中国历史朝代疆域
        </Typography>
        <Typography variant="body2" color="text.secondary">
          点击下方按钮切换不同朝代的疆域范围，查看中国历代版图变迁
        </Typography>
      </Paper>

      {/* 地图容器 */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          minHeight: 0,
          borderRadius: 2,
          overflow: 'hidden',
          background: 'var(--app-panel-bg, rgba(255,255,255,0.9))',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--theme-glass-border, rgba(0,0,0,0.1))',
          position: 'relative',
        }}
      >
        <DynastyBoundaryMap
          width="100%"
          height="100%"
          selectedDynastyId={selectedDynastyId}
          onDynastyChange={setSelectedDynastyId}
        />
      </Paper>

      {/* 朝代信息 */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          background: 'var(--app-panel-bg, rgba(255,255,255,0.8))',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--theme-glass-border, rgba(0,0,0,0.1))',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: selectedDynasty?.color || 'var(--color-gray-500)',
            }}
          />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {selectedDynasty?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedDynasty?.period}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default DynastyBoundariesPage;
