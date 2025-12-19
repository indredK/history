import {
  Stack,
  Button
} from '@mui/material';
import {
  FilterList,
} from '@mui/icons-material';
import { useState } from 'react';
import { EventTypeFilterPopover } from './EventTypeFilterPopover';
import { buttonConfig } from '@/config';

export function TimelineFunctions() {
  // 事件类型筛选 Popover 状态
  const [eventTypeAnchorEl, setEventTypeAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleEventTypeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setEventTypeAnchorEl(event.currentTarget);
  };

  const handleEventTypeClose = () => {
    setEventTypeAnchorEl(null);
  };

  return (
    <Stack spacing={1}>
      {/* 事件类型筛选 */}
      <Button
        startIcon={<FilterList />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleEventTypeClick}
        sx={buttonConfig.functionButton}
      >
        事件类型
      </Button>
      <EventTypeFilterPopover
        anchorEl={eventTypeAnchorEl}
        onClose={handleEventTypeClose}
      />
    </Stack>
  );
}