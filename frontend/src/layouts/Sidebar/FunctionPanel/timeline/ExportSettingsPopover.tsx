import { Box, Popover, Stack, Typography, FormControlLabel, Checkbox, Button, Divider } from '@mui/material';

interface ExportSettingsPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

export function ExportSettingsPopover({ anchorEl, onClose }: ExportSettingsPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'export-settings-popover' : undefined;

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
          导出设置
        </Typography>
        <Stack spacing={2}>
          <Stack spacing={1}>
            <FormControlLabel
              control={<Checkbox />}
              label="导出事件数据"
              sx={{ margin: 0 }}
            />
            <FormControlLabel
              control={<Checkbox />}
              label="导出时间轴配置"
              sx={{ margin: 0 }}
            />
            <FormControlLabel
              control={<Checkbox />}
              label="包含附件信息"
              sx={{ margin: 0 }}
            />
          </Stack>
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" gutterBottom>
              导出格式
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
                JSON
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
                CSV
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
                PDF
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
              导出数据
            </Button>
          </Box>
        </Stack>
      </Box>
    </Popover>
  );
}