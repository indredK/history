/**
 * 帝王详情弹窗组件
 */

import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Chip, IconButton, Avatar, Divider, List, ListItem, ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WarningIcon from '@mui/icons-material/Warning';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import type { Emperor } from '@/services/people/emperors/types';
import { emperorService } from '@/services/people/emperors';

interface EmperorDetailModalProps {
  emperor: Emperor | null;
  open: boolean;
  onClose: () => void;
}

const dynastyColors: Record<string, { bg: string; text: string }> = {
  '上古': { bg: 'rgba(139, 69, 19, 0.15)', text: '#8B4513' },
  '秦': { bg: 'rgba(0, 0, 0, 0.15)', text: '#333333' },
  '西汉': { bg: 'rgba(220, 20, 60, 0.15)', text: '#DC143C' },
  '东汉': { bg: 'rgba(139, 0, 0, 0.15)', text: '#8B0000' },
  '唐': { bg: 'rgba(156, 39, 176, 0.15)', text: '#9c27b0' },
  '北宋': { bg: 'rgba(33, 150, 243, 0.15)', text: '#2196f3' },
  '南宋': { bg: 'rgba(30, 136, 229, 0.15)', text: '#1E88E5' },
  '元': { bg: 'rgba(63, 81, 181, 0.15)', text: '#3F51B5' },
  '明': { bg: 'rgba(244, 67, 54, 0.15)', text: '#F44336' },
  '清': { bg: 'rgba(255, 235, 59, 0.15)', text: '#F9A825' },
};

export function EmperorDetailModal({ emperor, open, onClose }: EmperorDetailModalProps) {
  if (!emperor) return null;

  const dynastyColor = dynastyColors[emperor.dynasty] || { bg: 'rgba(158, 158, 158, 0.15)', text: '#9e9e9e' };
  const hasPortrait = emperor.portraitUrl && emperor.portraitUrl.trim() !== '';
  const firstChar = emperor.name.charAt(0);
  const reignPeriod = emperorService.formatReignPeriod(emperor);
  const reignYears = emperorService.calculateReignYears(emperor);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth aria-labelledby="emperor-detail-title" PaperProps={{ sx: { background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', maxHeight: '90vh' } }}>
      <DialogTitle id="emperor-detail-title" sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar {...(hasPortrait ? { src: emperor.portraitUrl } : {})} alt={emperor.name} sx={{ width: 72, height: 72, backgroundColor: dynastyColor.bg, color: dynastyColor.text, fontWeight: 'bold', fontSize: '2rem', border: `3px solid ${dynastyColor.text}` }}>
            {!hasPortrait && firstChar}
          </Avatar>
          <Box>
            <Typography variant="h5" component="span" sx={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{emperor.name}</Typography>
            {emperor.templeName && <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mt: 0.5 }}>{emperor.templeName}{emperor.posthumousName && ` · ${emperor.posthumousName}`}</Typography>}
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
              <Chip label={emperor.dynasty} size="small" sx={{ backgroundColor: dynastyColor.bg, color: dynastyColor.text, fontWeight: 500 }} />
              <Chip label={`在位${reignYears}年`} size="small" variant="outlined" sx={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }} />
            </Box>
          </Box>
        </Box>
        <IconButton aria-label="关闭" onClick={onClose} sx={{ color: 'var(--color-text-secondary)' }}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ color: 'var(--color-text-primary)', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayIcon sx={{ fontSize: '1.2rem', color: dynastyColor.text }} />在位时间
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--color-text-primary)', mb: 1 }}>{reignPeriod}</Typography>
          {emperor.eraNames.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {emperor.eraNames.map((era, index) => (
                <Chip key={index} label={`${era.name} (${era.startYear < 0 ? `前${Math.abs(era.startYear)}` : era.startYear}-${era.endYear < 0 ? `前${Math.abs(era.endYear)}` : era.endYear})`} size="small" variant="outlined" sx={{ borderColor: dynastyColor.text, color: dynastyColor.text }} />
              ))}
            </Box>
          )}
        </Box>

        {emperor.biography && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ color: 'var(--color-text-primary)', fontWeight: 600, mb: 1.5 }}>人物简介</Typography>
              <Typography variant="body1" sx={{ color: 'var(--color-text-primary)', lineHeight: 1.8, textAlign: 'justify' }}>{emperor.biography}</Typography>
            </Box>
          </>
        )}

        {emperor.achievements.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ color: 'var(--color-text-primary)', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEventsIcon sx={{ fontSize: '1.2rem', color: '#ffc107' }} />主要功绩
              </Typography>
              <List dense disablePadding>
                {emperor.achievements.map((achievement, index) => (
                  <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                    <ListItemText primary={<Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 1 }}><span style={{ color: '#4caf50' }}>•</span>{achievement}</Typography>} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        )}

        {emperor.failures.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ color: 'var(--color-text-primary)', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon sx={{ fontSize: '1.2rem', color: '#ff9800' }} />重大失误与争议
              </Typography>
              <List dense disablePadding>
                {emperor.failures.map((failure, index) => (
                  <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                    <ListItemText primary={<Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 1 }}><span style={{ color: '#ff9800' }}>•</span>{failure}</Typography>} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        )}

        {emperor.evaluations.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ color: 'var(--color-text-primary)', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MenuBookIcon sx={{ fontSize: '1.2rem', color: '#2196f3' }} />历史评价
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {emperor.evaluations.map((evaluation, index) => (
                  <Box key={index} sx={{ p: 2, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-tertiary)', borderLeft: `3px solid ${dynastyColor.text}` }}>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-primary)', fontStyle: 'italic', lineHeight: 1.8, mb: 1 }}>"{evaluation.content}"</Typography>
                    <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>—— {evaluation.source}{evaluation.author && ` · ${evaluation.author}`}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        )}

        {emperor.sources.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'var(--color-text-secondary)', mb: 1 }}>参考资料</Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{emperor.sources.join('、')}</Typography>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">关闭</Button>
      </DialogActions>
    </Dialog>
  );
}

export default EmperorDetailModal;
