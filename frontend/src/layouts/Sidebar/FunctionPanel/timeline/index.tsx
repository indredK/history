import {
  Stack,
  Button,
  TextField,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material';
import { Search, RestartAlt } from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
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

function syncRangeFromInputs(
  startText: string,
  endText: string,
  setJumpRange: (_range: { startYear: number; endYear: number } | null) => void,
  setCurrentTimeRange: (_range: [number, number] | null) => void,
) {
  const startYear = parseYearValue(startText);
  const endYear = parseYearValue(endText);

  if (startYear === null || endYear === null || startYear > endYear) {
    return;
  }

  setJumpRange({ startYear, endYear });
  setCurrentTimeRange([startYear, endYear]);
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
    currentTimeRange,
    densityMode,
    setKeyword,
    setJumpRange,
    setCurrentTimeRange,
    setDensityMode,
    clearFilters,
  } = useTimelineStore();

  const handleEventTypeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setEventTypeAnchorEl(event.currentTarget);
  };

  const handleDynastyClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDynastyAnchorEl(event.currentTarget);
  };

  const handleJump = () => {
    syncRangeFromInputs(jumpStartYear, jumpEndYear, setJumpRange, setCurrentTimeRange);
  };

  const handleJumpReset = () => {
    setJumpStartYear('');
    setJumpEndYear('');
    setJumpRange(null);
    setCurrentTimeRange(null);
  };

  useEffect(() => {
    if (jumpRange) {
      setJumpStartYear(String(jumpRange.startYear));
      setJumpEndYear(String(jumpRange.endYear));
      return;
    }

    if (currentTimeRange) {
      setJumpStartYear(String(Math.round(currentTimeRange[0])));
      setJumpEndYear(String(Math.round(currentTimeRange[1])));
      return;
    }

    setJumpStartYear('');
    setJumpEndYear('');
  }, [currentTimeRange, jumpRange]);

  return (
    <Stack
      spacing={1}
      sx={{
        p: 1.1,
        borderRadius: '12px',
        background: 'rgba(var(--glass-surface-rgb), 0.12)',
        border: '1px solid rgba(148, 163, 184, 0.12)',
      }}
    >
      <TextField
        size="small"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="搜索事件"
        sx={{
          '& .MuiInputBase-root': {
            minHeight: 32,
            fontSize: 12.5,
            borderRadius: '10px',
          },
          '& .MuiInputBase-input': {
            py: 0.6,
          },
        }}
        slotProps={{
          input: {
            startAdornment: <Search fontSize="small" sx={{ mr: 0.75, color: 'var(--color-text-tertiary)' }} />,
          },
        }}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0.8,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          onClick={handleDynastyClick}
          sx={{
            ...buttonConfig.functionButton,
            minHeight: 32,
            px: 1,
            fontSize: 11.5,
            py: 0.3,
            justifyContent: 'center',
          }}
        >
          {selectedDynastyIds.length === 0 ? '全部朝代' : `朝代 ${selectedDynastyIds.length}`}
        </Button>

        <Button
          variant="outlined"
          size="small"
          onClick={handleEventTypeClick}
          sx={{
            ...buttonConfig.functionButton,
            minHeight: 32,
            px: 1,
            fontSize: 11.5,
            py: 0.3,
            justifyContent: 'center',
          }}
        >
          事件类型
        </Button>
      </Box>

      <EventTypeFilterPopover
        mode="dynasty"
        anchorEl={dynastyAnchorEl}
        onClose={() => setDynastyAnchorEl(null)}
        dynasties={dynasties as Dynasty[]}
      />

      <EventTypeFilterPopover
        mode="eventType"
        anchorEl={eventTypeAnchorEl}
        onClose={() => setEventTypeAnchorEl(null)}
      />

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.12)' }} />

      <Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 0.6,
          }}
        >
          <TextField
            size="small"
            placeholder="起始年"
            value={jumpStartYear}
            onChange={(event) => {
              const next = event.target.value;
              setJumpStartYear(next);
              syncRangeFromInputs(next, jumpEndYear, setJumpRange, setCurrentTimeRange);
            }}
            sx={{ '& .MuiInputBase-root': { minHeight: 32, fontSize: 12 } }}
          />
          <TextField
            size="small"
            placeholder="结束年"
            value={jumpEndYear}
            onChange={(event) => {
              const next = event.target.value;
              setJumpEndYear(next);
              syncRangeFromInputs(jumpStartYear, next, setJumpRange, setCurrentTimeRange);
            }}
            sx={{ '& .MuiInputBase-root': { minHeight: 32, fontSize: 12 } }}
          />
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 0.6,
            alignItems: 'center',
            mt: 0.6,
          }}
        >
          <Button size="small" variant="contained" onClick={handleJump} sx={{ minHeight: 32, minWidth: 0, px: 1.1, fontSize: 11.5 }}>
            跳转
          </Button>
          <Button size="small" variant="text" onClick={handleJumpReset} sx={{ minHeight: 32, minWidth: 0, px: 0.8, fontSize: 11.5 }}>
            清除
          </Button>
        </Box>
        {jumpRange && (
          <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'var(--color-text-tertiary)', fontSize: 10.5 }}>
            {jumpRange.startYear} ~ {jumpRange.endYear}
          </Typography>
        )}
      </Box>

      <Box>
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
          sx={{
            '& .MuiToggleButton-root': {
              minHeight: 30,
              fontSize: 11.5,
              py: 0.2,
              px: 0.6,
            },
          }}
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
        sx={{
          ...buttonConfig.functionButton,
          minHeight: 30,
          fontSize: 11.5,
          py: 0.15,
          opacity: 0.9,
        }}
      >
        清空筛选
      </Button>
    </Stack>
  );
}
