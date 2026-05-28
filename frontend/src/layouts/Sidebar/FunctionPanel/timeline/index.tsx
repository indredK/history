import {
  Stack,
  Button,
  TextField,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { FilterList, Search, RestartAlt, Timeline } from '@mui/icons-material';
import { useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import { EventTypeFilterPopover } from './EventTypeFilterPopover';
import { buttonConfig } from '@/config';
import { getDynasties } from '@/services/dataClient';
import { useTimelineStore } from '@/store';
import type { Dynasty } from '@/services/culture/types';

function parseYearValue(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function TimelineFunctions() {
  const [eventTypeAnchorEl, setEventTypeAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [dynastyAnchorEl, setDynastyAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [jumpStartYear, setJumpStartYear] = useState('');
  const [jumpEndYear, setJumpEndYear] = useState('');
  const {
    data: dynastiesData,
  } = useRequest(async () => {
    const response = await getDynasties();
    return response.data;
  });

  const dynasties = useMemo(() => dynastiesData ?? [], [dynastiesData]);
  const {
    selectedDynastyIds,
    keyword,
    jumpRange,
    densityMode,
    setKeyword,
    setJumpRange,
    setDensityMode,
    clearFilters,
  } = useTimelineStore();

  const selectedDynastyLabel = selectedDynastyIds.length === 0
    ? '全部朝代'
    : `${selectedDynastyIds.length} 个朝代`;

  const handleEventTypeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setEventTypeAnchorEl(event.currentTarget);
  };

  const handleDynastyClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDynastyAnchorEl(event.currentTarget);
  };

  const handleJump = () => {
    const startYear = parseYearValue(jumpStartYear);
    const endYear = parseYearValue(jumpEndYear);

    if (startYear === null || endYear === null || startYear > endYear) {
      return;
    }

    setJumpRange({ startYear, endYear });
  };

  const handleJumpReset = () => {
    setJumpStartYear('');
    setJumpEndYear('');
    setJumpRange(null);
  };

  return (
    <Stack spacing={1.5}>
      <TextField
        size="small"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="搜索事件名称或描述"
        InputProps={{
          startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'var(--color-text-tertiary)' }} />,
        }}
      />

      <Button
        startIcon={<Timeline />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleDynastyClick}
        sx={buttonConfig.functionButton}
      >
        朝代筛选：{selectedDynastyLabel}
      </Button>

      <EventTypeFilterPopover
        mode="dynasty"
        anchorEl={dynastyAnchorEl}
        onClose={() => setDynastyAnchorEl(null)}
        dynasties={dynasties as Dynasty[]}
      />

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
        mode="eventType"
        anchorEl={eventTypeAnchorEl}
        onClose={() => setEventTypeAnchorEl(null)}
      />

      <Box>
        <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', mb: 0.75, display: 'block' }}>
          时间范围跳转
        </Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="起始年"
            value={jumpStartYear}
            onChange={(event) => setJumpStartYear(event.target.value)}
          />
          <TextField
            size="small"
            placeholder="结束年"
            value={jumpEndYear}
            onChange={(event) => setJumpEndYear(event.target.value)}
          />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button size="small" variant="contained" onClick={handleJump}>
            跳转
          </Button>
          <Button size="small" variant="text" onClick={handleJumpReset}>
            清除
          </Button>
        </Stack>
        {jumpRange && (
          <Typography variant="caption" sx={{ mt: 0.75, display: 'block', color: 'var(--color-text-tertiary)' }}>
            当前跳转区间：{jumpRange.startYear} ~ {jumpRange.endYear}
          </Typography>
        )}
      </Box>

      <Box>
        <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', mb: 0.75, display: 'block' }}>
          显示模式
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={densityMode}
          onChange={(_, value) => {
            if (value) {
              setDensityMode(value);
            }
          }}
          fullWidth
        >
          <ToggleButton value="auto">自动</ToggleButton>
          <ToggleButton value="major-only">重大</ToggleButton>
          <ToggleButton value="all">全部</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Button
        startIcon={<RestartAlt />}
        variant="text"
        fullWidth
        size="small"
        onClick={clearFilters}
        sx={buttonConfig.functionButton}
      >
        清空筛选
      </Button>
    </Stack>
  );
}
