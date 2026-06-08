/**
 * 清朝统治者弹窗标题栏 —— 头像 + 姓名 + 庙号 + 时期/在位 chips
 */

import { Avatar, Box, Chip, DialogTitle, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { QingRuler } from '@/services/person/qing/types';
import { qingRulerService } from '@/services/person/qing';
import { PERIOD_COLORS, DEFAULT_PERIOD_COLOR, getPeriod } from './period';

interface QingHeaderProps {
  ruler: QingRuler;
  onClose: () => void;
}

export function QingHeader({ ruler, onClose }: QingHeaderProps) {
  const period = getPeriod(ruler.reignStart);
  const periodColor = PERIOD_COLORS[period] || DEFAULT_PERIOD_COLOR;
  const hasPortrait = ruler.portraitUrl && ruler.portraitUrl.trim() !== '';
  const firstChar = ruler.name.charAt(0);
  const title = qingRulerService.getTitle(ruler);
  const reignYears = qingRulerService.calculateReignYears(ruler);

  return (
    <DialogTitle
      id="qing-ruler-detail-title"
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        pb: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          {...(hasPortrait ? { src: ruler.portraitUrl } : {})}
          alt={ruler.name}
          sx={{
            width: 72,
            height: 72,
            backgroundColor: periodColor.bg,
            color: periodColor.text,
            fontWeight: 'bold',
            fontSize: '2rem',
            border: `3px solid ${periodColor.text}`,
          }}
        >
          {!hasPortrait && firstChar}
        </Avatar>

        <Box>
          <Typography
            variant="h5"
            component="span"
            sx={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}
          >
            {ruler.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mt: 0.5 }}>
            {title}
          </Typography>

          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
            <Chip
              label={period}
              size="small"
              sx={{
                backgroundColor: periodColor.bg,
                color: periodColor.text,
                fontWeight: 500,
              }}
            />
            {reignYears !== null && (
              <Chip
                label={`在位${reignYears}年`}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      <IconButton
        aria-label="关闭"
        onClick={onClose}
        sx={{ color: 'var(--color-text-secondary)' }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  );
}
