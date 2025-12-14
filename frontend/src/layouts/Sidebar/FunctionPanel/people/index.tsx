import {
  Stack,
  Button,
  TextField
} from '@mui/material';
import {
  FilterList,
  AccountTree
} from '@mui/icons-material';
import { useState } from 'react';
import { PeopleDynastyFilterPopover } from './PeopleDynastyFilterPopover';
import { OccupationFilterPopover } from './OccupationFilterPopover';
import { RelationshipMapSettingsPopover } from './RelationshipMapSettingsPopover';
import { functionButtonStyles, getThemedSearchFieldStyles } from '../popoverStyles';

export function PeopleFunctions() {
  // 朝代筛选 Popover 状态
  const [dynastyFilterAnchorEl, setDynastyFilterAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 职业分类 Popover 状态
  const [occupationFilterAnchorEl, setOccupationFilterAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 关系图设置 Popover 状态
  const [relationshipMapSettingsAnchorEl, setRelationshipMapSettingsAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 处理 Popover 打开
  const handleDynastyFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDynastyFilterAnchorEl(event.currentTarget);
  };

  const handleOccupationFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOccupationFilterAnchorEl(event.currentTarget);
  };

  const handleRelationshipMapSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setRelationshipMapSettingsAnchorEl(event.currentTarget);
  };

  // 处理 Popover 关闭
  const handleDynastyFilterClose = () => {
    setDynastyFilterAnchorEl(null);
  };

  const handleOccupationFilterClose = () => {
    setOccupationFilterAnchorEl(null);
  };

  const handleRelationshipMapSettingsClose = () => {
    setRelationshipMapSettingsAnchorEl(null);
  };

  return (
    <Stack spacing={1}>
      {/* 人物搜索 */}
      <TextField
          fullWidth
          placeholder="搜索历史人物..."
          size="small"
          sx={getThemedSearchFieldStyles('people')}
        />

      {/* 朝代筛选 */}
      <Button
        startIcon={<FilterList />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleDynastyFilterClick}
        sx={functionButtonStyles}
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
        sx={functionButtonStyles}
      >
        职业分类
      </Button>
      <OccupationFilterPopover
        anchorEl={occupationFilterAnchorEl}
        onClose={handleOccupationFilterClose}
      />

      {/* 关系图设置 */}
      <Button
        startIcon={<AccountTree />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleRelationshipMapSettingsClick}
        sx={functionButtonStyles}
      >
        关系图设置
      </Button>
      <RelationshipMapSettingsPopover
        anchorEl={relationshipMapSettingsAnchorEl}
        onClose={handleRelationshipMapSettingsClose}
      />
    </Stack>
  );
}

export { OccupationFilterPopover } from './OccupationFilterPopover';
export { PeopleDynastyFilterPopover } from './PeopleDynastyFilterPopover';
export { RelationshipMapSettingsPopover } from './RelationshipMapSettingsPopover';
