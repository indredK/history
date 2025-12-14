import { useState, useEffect } from 'react';
import {
  Box,
  Popover,
  Button,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useTimelineStore } from '../../store';

interface YearSettingsPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function YearSettingsPopover({ anchorEl, onClose }: YearSettingsPopoverProps) {
  const { startYear, endYear, setYears } = useTimelineStore();
  const [tempStartYear, setTempStartYear] = useState<number>(startYear);
  const [tempEndYear, setTempEndYear] = useState<number>(endYear);

  useEffect(() => {
    setTempStartYear(startYear);
    setTempEndYear(endYear);
  }, [startYear, endYear]);

  const handleApply = () => {
    setYears(tempStartYear, tempEndYear);
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
            backdropFilter: 'blur(10px)'
          }
        }
      }}
    >
      <Box sx={{ p: 3, minWidth: 250 }}>
        <Typography variant="subtitle1" gutterBottom>
          年份设置
        </Typography>
        <Stack spacing={3} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="body2" gutterBottom sx={{ 
              color: 'var(--color-text-secondary)',
              fontWeight: 'medium'
            }}>
              开始年份
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={tempStartYear}
              onChange={(e) => setTempStartYear(Number(e.target.value))}
              slotProps={{ htmlInput: { min: 1000, max: 2025 } }}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '2px solid var(--color-border-medium)',
                  '&:hover': {
                    borderColor: 'var(--color-primary)',
                    boxShadow: '0 0 10px rgba(255, 61, 0, 0.2)'
                  },
                  '&.Mui-focused': {
                    borderColor: 'var(--color-primary)',
                    boxShadow: '0 0 20px rgba(255, 61, 0, 0.3), var(--shadow-glow)'
                  },
                  transition: 'all var(--transition-normal)'
                },
                '& .MuiInputBase-input': {
                  color: 'var(--color-text-primary)'
                }
              }}
            />
          </Box>
          <Box>
            <Typography variant="body2" gutterBottom sx={{ 
              color: 'var(--color-text-secondary)',
              fontWeight: 'medium'
            }}>
              结束年份
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={tempEndYear}
              onChange={(e) => setTempEndYear(Number(e.target.value))}
              slotProps={{ htmlInput: { min: tempStartYear, max: 2025 } }}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '2px solid var(--color-border-medium)',
                  '&:hover': {
                    borderColor: 'var(--color-primary)',
                    boxShadow: '0 0 10px rgba(255, 61, 0, 0.2)'
                  },
                  '&.Mui-focused': {
                    borderColor: 'var(--color-primary)',
                    boxShadow: '0 0 20px rgba(255, 61, 0, 0.3), var(--shadow-glow)'
                  },
                  transition: 'all var(--transition-normal)'
                },
                '& .MuiInputBase-input': {
                  color: 'var(--color-text-primary)'
                }
              }}
            />
          </Box>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={onClose} size="small" sx={{
            borderRadius: 'var(--radius-md)',
            '&:hover': {
              background: 'var(--color-bg-tertiary)',
              boxShadow: 'var(--shadow-md)',
              transform: 'translateY(-1px)'
            },
            transition: 'all var(--transition-normal)'
          }}>
            取消
          </Button>
          <Button onClick={handleApply} size="small" variant="contained" sx={{
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary-gradient)',
            boxShadow: 'var(--shadow-md), var(--shadow-glow)',
            '&:hover': {
              background: 'var(--color-primary-gradient)',
              boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
              transform: 'translateY(-1px)'
            },
            transition: 'all var(--transition-normal)'
          }}>
            应用
          </Button>
        </Stack>
      </Box>
    </Popover>
  );
}
