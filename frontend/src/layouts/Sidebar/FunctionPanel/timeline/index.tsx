import {
  Stack,
  Button
} from '@mui/material';
import {
  FilterList,
  Tune
} from '@mui/icons-material';
import { useState } from 'react';
import { DynastyFilterPopover } from './DynastyFilterPopover';
import { EventTypeFilterPopover } from './EventTypeFilterPopover';
import { DisplaySettingsPopover } from './DisplaySettingsPopover';
import { AdvancedFilterPopover } from './AdvancedFilterPopover';
import { ExportSettingsPopover } from './ExportSettingsPopover';
import { DataAnalysisPopover } from './DataAnalysisPopover';
import { PersonalizationSettingsPopover } from './PersonalizationSettingsPopover';
import { functionButtonStyles } from '../popoverStyles';

export function TimelineFunctions() {
  // 朝代筛选 Popover 状态
  const [dynastyAnchorEl, setDynastyAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 事件类型筛选 Popover 状态
  const [eventTypeAnchorEl, setEventTypeAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 显示设置 Popover 状态
  const [displaySettingsAnchorEl, setDisplaySettingsAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 高级筛选 Popover 状态
  const [advancedFilterAnchorEl, setAdvancedFilterAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 导出设置 Popover 状态
  const [exportSettingsAnchorEl, setExportSettingsAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 数据分析 Popover 状态
  const [dataAnalysisAnchorEl, setDataAnalysisAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 个性化设置 Popover 状态
  const [personalizationSettingsAnchorEl, setPersonalizationSettingsAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 处理 Popover 打开
  const handleDynastyClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDynastyAnchorEl(event.currentTarget);
  };

  const handleEventTypeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setEventTypeAnchorEl(event.currentTarget);
  };

  const handleDisplaySettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDisplaySettingsAnchorEl(event.currentTarget);
  };

  const handleAdvancedFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAdvancedFilterAnchorEl(event.currentTarget);
  };

  const handleExportSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportSettingsAnchorEl(event.currentTarget);
  };

  const handleDataAnalysisClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDataAnalysisAnchorEl(event.currentTarget);
  };

  const handlePersonalizationSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPersonalizationSettingsAnchorEl(event.currentTarget);
  };

  // 处理 Popover 关闭
  const handleDynastyClose = () => {
    setDynastyAnchorEl(null);
  };

  const handleEventTypeClose = () => {
    setEventTypeAnchorEl(null);
  };

  const handleDisplaySettingsClose = () => {
    setDisplaySettingsAnchorEl(null);
  };

  const handleAdvancedFilterClose = () => {
    setAdvancedFilterAnchorEl(null);
  };

  const handleExportSettingsClose = () => {
    setExportSettingsAnchorEl(null);
  };

  const handleDataAnalysisClose = () => {
    setDataAnalysisAnchorEl(null);
  };

  const handlePersonalizationSettingsClose = () => {
    setPersonalizationSettingsAnchorEl(null);
  };

  return (
    <Stack spacing={1}>
      {/* 朝代筛选 */}
      <Button
        startIcon={<FilterList />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleDynastyClick}
        sx={functionButtonStyles}
      >
        朝代筛选
      </Button>
      <DynastyFilterPopover
        anchorEl={dynastyAnchorEl}
        onClose={handleDynastyClose}
      />

      {/* 事件类型筛选 */}
      <Button
        startIcon={<FilterList />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleEventTypeClick}
        sx={functionButtonStyles}
      >
        事件类型
      </Button>
      <EventTypeFilterPopover
        anchorEl={eventTypeAnchorEl}
        onClose={handleEventTypeClose}
      />

      {/* 显示设置 */}
      <Button
        startIcon={<Tune />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleDisplaySettingsClick}
        sx={functionButtonStyles}
      >
        显示设置
      </Button>
      <DisplaySettingsPopover
        anchorEl={displaySettingsAnchorEl}
        onClose={handleDisplaySettingsClose}
      />

      {/* 高级筛选 */}
      <Button
        startIcon={<Tune />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleAdvancedFilterClick}
        sx={functionButtonStyles}
      >
        高级筛选
      </Button>
      <AdvancedFilterPopover
        anchorEl={advancedFilterAnchorEl}
        onClose={handleAdvancedFilterClose}
      />

      {/* 导出设置 */}
      <Button
        startIcon={<Tune />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleExportSettingsClick}
        sx={functionButtonStyles}
      >
        导出设置
      </Button>
      <ExportSettingsPopover
        anchorEl={exportSettingsAnchorEl}
        onClose={handleExportSettingsClose}
      />

      {/* 数据分析 */}
      <Button
        startIcon={<Tune />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleDataAnalysisClick}
        sx={functionButtonStyles}
      >
        数据分析
      </Button>
      <DataAnalysisPopover
        anchorEl={dataAnalysisAnchorEl}
        onClose={handleDataAnalysisClose}
      />

      {/* 个性化设置 */}
      <Button
        startIcon={<Tune />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handlePersonalizationSettingsClick}
        sx={functionButtonStyles}
      >
        个性化设置
      </Button>
      <PersonalizationSettingsPopover
        anchorEl={personalizationSettingsAnchorEl}
        onClose={handlePersonalizationSettingsClose}
      />
    </Stack>
  );
}

export { AdvancedFilterPopover } from './AdvancedFilterPopover';
export { DataAnalysisPopover } from './DataAnalysisPopover';
export { DisplaySettingsPopover } from './DisplaySettingsPopover';
export { DynastyFilterPopover } from './DynastyFilterPopover';
export { EventTypeFilterPopover } from './EventTypeFilterPopover';
export { ExportSettingsPopover } from './ExportSettingsPopover';
export { PersonalizationSettingsPopover } from './PersonalizationSettingsPopover';
