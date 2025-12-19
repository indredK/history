import {
  Stack,
  Button,
  TextField
} from '@mui/material';
import {
  FilterList,
} from '@mui/icons-material';
import { useState } from 'react';
import { PeopleDynastyFilterPopover } from './PeopleDynastyFilterPopover';
import { OccupationFilterPopover } from './OccupationFilterPopover';
import { buttonConfig, uiUtils } from '@/config';

export function PeopleFunctions() {
  // 朝代筛选 Popover 状态
  const [dynastyFilterAnchorEl, setDynastyFilterAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 职业分类 Popover 状态
  const [occupationFilterAnchorEl, setOccupationFilterAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 处理 Popover 打开
  const handleDynastyFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDynastyFilterAnchorEl(event.currentTarget);
  };

  const handleOccupationFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOccupationFilterAnchorEl(event.currentTarget);
  };

  // 处理 Popover 关闭
  const handleDynastyFilterClose = () => {
    setDynastyFilterAnchorEl(null);
  };

  const handleOccupationFilterClose = () => {
    setOccupationFilterAnchorEl(null);
  };

  return (
    <Stack spacing={1}>
      {/* 人物搜索 */}
      <TextField
          fullWidth
          placeholder="搜索历史人物..."
          size="small"
          sx={uiUtils.getThemedSearchFieldStyles('people')}
        />

      {/* 朝代筛选 */}
      <Button
        startIcon={<FilterList />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleDynastyFilterClick}
        sx={buttonConfig.functionButton}
      >
        朝代筛选
      </Button>
      <PeopleDynastyFilterPopover
        anchorEl={dynastyFilterAnchorEl}
        onClose={handleDynastyFilterClose}
      />

      {/* 职业分类 */}
      <Button
        startIcon={<FilterList />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleOccupationFilterClick}
        sx={buttonConfig.functionButton}
      >
        职业分类
      </Button>
      <OccupationFilterPopover
        anchorEl={occupationFilterAnchorEl}
        onClose={handleOccupationFilterClose}
      />
    </Stack>
  );
}
