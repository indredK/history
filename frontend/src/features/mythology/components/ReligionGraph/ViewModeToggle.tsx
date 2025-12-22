/**
 * 视图模式切换组件
 * View Mode Toggle Component
 */

import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useReligionStore, type ViewMode } from '@/store/religionStore';

/**
 * 视图模式切换按钮
 * 支持力导向图和树状图切换
 */
export function ViewModeToggle() {
  const viewMode = useReligionStore(state => state.viewMode);
  const setViewMode = useReligionStore(state => state.setViewMode);

  const handleChange = (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={handleChange}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            padding: '4px 8px',
            border: '1px solid var(--glass-border-color, rgba(255, 255, 255, 0.18))',
            color: 'var(--color-text-secondary)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            fontSize: '0.7rem',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&.Mui-selected': {
              color: 'var(--color-primary)',
              backgroundColor: 'rgba(var(--color-primary-rgb, 100, 150, 255), 0.15)',
              '&:hover': {
                backgroundColor: 'rgba(var(--color-primary-rgb, 100, 150, 255), 0.25)',
              },
            },
            '& .MuiSvgIcon-root': {
              fontSize: '1rem',
              marginRight: '4px',
            },
          },
        }}
      >
        <ToggleButton value="force">
          <Tooltip title="力导向图" placement="top">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BubbleChartIcon />
              <span>力导向</span>
            </Box>
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="tree">
          <Tooltip title="树状图" placement="top">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccountTreeIcon />
              <span>树状图</span>
            </Box>
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

export default ViewModeToggle;
