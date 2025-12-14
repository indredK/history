import {
  Stack,
  Typography,
  FormControlLabel,
  Checkbox,
  Chip,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Popover
} from '@mui/material';
import {
  FilterList,
  ViewTimeline,
  Map,
  ViewModule
} from '@mui/icons-material';
import { useState } from 'react';
import { CultureTypePopover } from './CultureTypePopover';
import { PeriodFilterPopover } from './PeriodFilterPopover';

export function CultureFunctions() {
  // 文化类型筛选 Popover 状态
  const [cultureTypeAnchorEl, setCultureTypeAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 时期筛选 Popover 状态
  const [periodFilterAnchorEl, setPeriodFilterAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 地域筛选 Popover 状态
  const [regionFilterAnchorEl, setRegionFilterAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 展示方式 Popover 状态
  const [displaySettingsAnchorEl, setDisplaySettingsAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 处理 Popover 打开
  const handleCultureTypeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setCultureTypeAnchorEl(event.currentTarget);
  };

  const handlePeriodFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPeriodFilterAnchorEl(event.currentTarget);
  };

  const handleRegionFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setRegionFilterAnchorEl(event.currentTarget);
  };

  const handleDisplaySettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDisplaySettingsAnchorEl(event.currentTarget);
  };

  // 处理 Popover 关闭
  const handleCultureTypeClose = () => {
    setCultureTypeAnchorEl(null);
  };

  const handlePeriodFilterClose = () => {
    setPeriodFilterAnchorEl(null);
  };

  const handleRegionFilterClose = () => {
    setRegionFilterAnchorEl(null);
  };

  const handleDisplaySettingsClose = () => {
    setDisplaySettingsAnchorEl(null);
  };

  return (
    <Stack spacing={1}>
      {/* 文化类型 */}
      <Button
        startIcon={<FilterList />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleCultureTypeClick}
        sx={{
          backgroundColor: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-lg)',
          padding: '6px 12px',
          borderColor: 'var(--color-border-medium)',
          '&:hover': {
            backgroundColor: 'var(--color-bg-quaternary)',
            borderColor: 'var(--color-primary)',
            boxShadow: 'var(--shadow-md)'
          }
        }}
      >
        文化类型
      </Button>
      <CultureTypePopover
        anchorEl={cultureTypeAnchorEl}
        onClose={handleCultureTypeClose}
      />

      {/* 时期筛选 */}
      <Button
        startIcon={<FilterList />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handlePeriodFilterClick}
        sx={{
          backgroundColor: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-lg)',
          padding: '6px 12px',
          borderColor: 'var(--color-border-medium)',
          '&:hover': {
            backgroundColor: 'var(--color-bg-quaternary)',
            borderColor: 'var(--color-primary)',
            boxShadow: 'var(--shadow-md)'
          }
        }}
      >
        时期筛选
      </Button>
      <PeriodFilterPopover
        anchorEl={periodFilterAnchorEl}
        onClose={handlePeriodFilterClose}
      />

      {/* 地域筛选 */}
      <Button
        startIcon={<FilterList />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleRegionFilterClick}
        sx={{
          backgroundColor: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-lg)',
          padding: '6px 12px',
          borderColor: 'var(--color-border-medium)',
          '&:hover': {
            backgroundColor: 'var(--color-bg-quaternary)',
            borderColor: 'var(--color-primary)',
            boxShadow: 'var(--shadow-md)'
          }
        }}
      >
        地域筛选
      </Button>
      <Popover
        id={regionFilterAnchorEl ? 'region-filter-popover' : undefined}
        open={Boolean(regionFilterAnchorEl)}
        anchorEl={regionFilterAnchorEl}
        onClose={handleRegionFilterClose}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        disableScrollLock
        elevation={8}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, var(--color-bg-card) 0%, var(--color-bg-secondary) 100%)',
              border: '1px solid var(--color-border-medium)',
              boxShadow: 'var(--shadow-xl), var(--shadow-glow)',
              backdropFilter: 'blur(10px)',
              p: 2
            }
          }
        }}
      >
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          地域筛选
        </Typography>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label="中原" size="small" variant="outlined" />
            <Chip label="江南" size="small" variant="outlined" />
            <Chip label="巴蜀" size="small" variant="outlined" />
            <Chip label="岭南" size="small" variant="outlined" />
            <Chip label="西北" size="small" variant="outlined" />
            <Chip label="东北" size="small" variant="outlined" />
          </Stack>
        </Stack>
      </Popover>

      {/* 展示方式 */}
      <Button
        startIcon={<ViewModule />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleDisplaySettingsClick}
        sx={{
          backgroundColor: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-lg)',
          padding: '6px 12px',
          borderColor: 'var(--color-border-medium)',
          '&:hover': {
            backgroundColor: 'var(--color-bg-quaternary)',
            borderColor: 'var(--color-primary)',
            boxShadow: 'var(--shadow-md)'
          }
        }}
      >
        展示方式
      </Button>
      <Popover
        id={displaySettingsAnchorEl ? 'display-settings-popover' : undefined}
        open={Boolean(displaySettingsAnchorEl)}
        anchorEl={displaySettingsAnchorEl}
        onClose={handleDisplaySettingsClose}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        disableScrollLock
        elevation={8}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, var(--color-bg-card) 0%, var(--color-bg-secondary) 100%)',
              border: '1px solid var(--color-border-medium)',
              boxShadow: 'var(--shadow-xl), var(--shadow-glow)',
              backdropFilter: 'blur(10px)',
              p: 2
            }
          }
        }}
      >
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          展示方式
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" sx={{ color: 'var(--color-text-tertiary)', mb: 1, display: 'block' }}>
              视图模式
            </Typography>
            <ToggleButtonGroup size="small" exclusive defaultValue="timeline">
              <ToggleButton value="timeline">
                <ViewTimeline sx={{ fontSize: 16, mr: 0.5 }} />
                时间线
              </ToggleButton>
              <ToggleButton value="map">
                <Map sx={{ fontSize: 16, mr: 0.5 }} />
                地图
              </ToggleButton>
              <ToggleButton value="category">
                <ViewModule sx={{ fontSize: 16, mr: 0.5 }} />
                分类
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <FormControlLabel
            control={<Checkbox size="small" defaultChecked />}
            label={<Typography variant="body2">显示详细信息</Typography>}
          />
          <FormControlLabel
            control={<Checkbox size="small" />}
            label={<Typography variant="body2">显示相关人物</Typography>}
          />
          <FormControlLabel
            control={<Checkbox size="small" />}
            label={<Typography variant="body2">显示影响关系</Typography>}
          />
        </Stack>
      </Popover>
    </Stack>
  );
}

export { CultureTypePopover } from './CultureTypePopover';
export { PeriodFilterPopover } from './PeriodFilterPopover';
