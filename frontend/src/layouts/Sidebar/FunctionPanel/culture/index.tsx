import {
  Stack,
  Button} from '@mui/material';
import {
  FilterList} from '@mui/icons-material';
import { useState } from 'react';
import { CultureTypePopover } from './CultureTypePopover';
import { PeriodFilterPopover } from './PeriodFilterPopover';
import { buttonConfig } from '@/config';

export function CultureFunctions() {
  // 文化类型筛选 Popover 状态
  const [cultureTypeAnchorEl, setCultureTypeAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 时期筛选 Popover 状态
  const [periodFilterAnchorEl, setPeriodFilterAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 处理 Popover 打开
  const handleCultureTypeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setCultureTypeAnchorEl(event.currentTarget);
  };

  const handlePeriodFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPeriodFilterAnchorEl(event.currentTarget);
  };

  // 处理 Popover 关闭
  const handleCultureTypeClose = () => {
    setCultureTypeAnchorEl(null);
  };

  const handlePeriodFilterClose = () => {
    setPeriodFilterAnchorEl(null);
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
        sx={buttonConfig.functionButton}
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
        sx={buttonConfig.functionButton}
      >
        时期筛选
      </Button>
      <PeriodFilterPopover
        anchorEl={periodFilterAnchorEl}
        onClose={handlePeriodFilterClose}
      />
    </Stack>
  );
}
