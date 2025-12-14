import { Box, Popover, Stack, Typography, FormControlLabel, Checkbox, Slider, Button, Divider } from '@mui/material';

interface PersonalizationSettingsPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function PersonalizationSettingsPopover({ anchorEl, onClose }: PersonalizationSettingsPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'personalization-settings-popover' : undefined;

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
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
            backdropFilter: 'blur(10px)'
          }
        }
      }}
    >
      <Box sx={{ p: 3, minWidth: 280 }}>
        <Typography variant="subtitle1" gutterBottom>
          个性化设置
        </Typography>
        <Stack spacing={2}>
          <Stack spacing={1}>
            <FormControlLabel
              control={<Checkbox />}
              label="深色主题"
              sx={{ margin: 0 }}
            />
            <FormControlLabel
              control={<Checkbox />}
              label="自动保存设置"
              sx={{ margin: 0 }}
            />
            <FormControlLabel
              control={<Checkbox />}
              label="记住上次浏览位置"
              sx={{ margin: 0 }}
            />
          </Stack>
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" gutterBottom>
              字体大小
            </Typography>
            <Slider
              defaultValue={50}
              valueLabelDisplay="auto"
              sx={{
                color: 'var(--color-primary)',
                '& .MuiSlider-thumb': {
                  backgroundColor: 'var(--color-primary)',
                },
                '& .MuiSlider-track': {
                  backgroundColor: 'var(--color-primary)',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: 'var(--color-border-medium)',
                }
              }}
            />
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" gutterBottom>
              界面语言
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: 'var(--radius-md)',
                  borderColor: 'var(--color-border-medium)',
                  color: 'var(--color-text-primary)',
                  '&:hover': {
                    borderColor: 'var(--color-primary)',
                    backgroundColor: 'var(--color-bg-tertiary)'
                  }
                }}
              >
                简体中文
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: 'var(--radius-md)',
                  borderColor: 'var(--color-border-medium)',
                  color: 'var(--color-text-primary)',
                  '&:hover': {
                    borderColor: 'var(--color-primary)',
                    backgroundColor: 'var(--color-bg-tertiary)'
                  }
                }}
              >
                English
              </Button>
            </Stack>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: 'var(--color-primary)',
                borderRadius: 'var(--radius-md)',
                '&:hover': {
                  backgroundColor: 'var(--color-primary-dark)',
                  boxShadow: 'var(--shadow-md)'
                }
              }}
            >
              保存设置
            </Button>
          </Box>
        </Stack>
      </Box>
    </Popover>
  );
}