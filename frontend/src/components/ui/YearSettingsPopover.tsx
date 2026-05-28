import { useEffect, useState } from 'react';
import {
  Box,
  Popover,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTimelineStore } from '@/store';

interface YearSettingsPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function YearSettingsPopover({ anchorEl, onClose }: YearSettingsPopoverProps) {
  const { jumpRange, currentTimeRange, setJumpRange } = useTimelineStore();
  const initialStartYear = jumpRange?.startYear ?? currentTimeRange?.[0] ?? -500;
  const initialEndYear = jumpRange?.endYear ?? currentTimeRange?.[1] ?? 2000;
  const [tempStartYear, setTempStartYear] = useState<number>(initialStartYear);
  const [tempEndYear, setTempEndYear] = useState<number>(initialEndYear);

  useEffect(() => {
    setTempStartYear(initialStartYear);
    setTempEndYear(initialEndYear);
  }, [initialEndYear, initialStartYear]);

  const handleApply = () => {
    setJumpRange({ startYear: tempStartYear, endYear: tempEndYear });
    onClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'year-settings-popover' : undefined;

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, var(--color-bg-card) 0%, var(--color-bg-secondary) 100%)',
            border: '1px solid var(--color-border-medium)',
            boxShadow: 'var(--shadow-xl), var(--shadow-glow)',
            backdropFilter: 'blur(10px)',
          },
        },
      }}
    >
      <Box sx={{ p: 3, minWidth: 250 }}>
        <Typography variant="subtitle1" gutterBottom>
          年份设置
        </Typography>
        <Stack spacing={3} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="body2" gutterBottom sx={{ color: 'var(--color-text-secondary)', fontWeight: 'medium' }}>
              开始年份
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={tempStartYear}
              onChange={(e) => setTempStartYear(Number(e.target.value))}
              size="small"
            />
          </Box>
          <Box>
            <Typography variant="body2" gutterBottom sx={{ color: 'var(--color-text-secondary)', fontWeight: 'medium' }}>
              结束年份
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={tempEndYear}
              onChange={(e) => setTempEndYear(Number(e.target.value))}
              size="small"
            />
          </Box>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={onClose} size="small">
            取消
          </Button>
          <Button onClick={handleApply} size="small" variant="contained">
            应用
          </Button>
        </Stack>
      </Box>
    </Popover>
  );
}
