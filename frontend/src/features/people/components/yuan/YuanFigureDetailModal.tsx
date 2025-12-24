/**
 * 元朝人物详情弹窗组件
 */

import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Chip, IconButton, Avatar, Divider, List, ListItem, ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HistoryIcon from '@mui/icons-material/History';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WorkIcon from '@mui/icons-material/Work';
import type { YuanFigure } from '@/services/person/yuan/types';
import { ROLE_LABELS } from '@/services/person/yuan/types';
import { yuanFigureService } from '@/services/person/yuan';

interface YuanFigureDetailModalProps {
  figure: YuanFigure | null;
  open: boolean;
  onClose: () => void;
}

const roleColors: Record<string, { bg: string; text: string }> = {
  emperor: { bg: 'rgba(244, 67, 54, 0.15)', text: '#F44336' },
  chancellor: { bg: 'rgba(156, 39, 176, 0.15)', text: '#9c27b0' },
  general: { bg: 'rgba(33, 150, 243, 0.15)', text: '#2196f3' },
  official: { bg: 'rgba(76, 175, 80, 0.15)', text: '#4caf50' },
  scholar: { bg: 'rgba(255, 152, 0, 0.15)', text: '#ff9800' },
  other: { bg: 'rgba(158, 158, 158, 0.15)', text: '#9e9e9e' },
};

export function YuanFigureDetailModal({ figure, open, onClose }: YuanFigureDetailModalProps) {
  if (!figure) return null;

  const safeRoleColor = (roleColors[figure.role] || roleColors.other)!;
  const hasPortrait = figure.portraitUrl && figure.portraitUrl.trim() !== '';
  const firstChar = figure.name.charAt(0);
  const lifespan = yuanFigureService.formatLifespan(figure);
  const age = yuanFigureService.calculateAge(figure);
  const roleLabel = ROLE_LABELS[figure.role];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth aria-labelledby="yuan-figure-detail-title" PaperProps={{ sx: { background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', maxHeight: '90vh' } }}>
      <DialogTitle id="yuan-figure-detail-title" sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar {...(hasPortrait ? { src: figure.portraitUrl } : {})} alt={figure.name} sx={{ width: 72, height: 72, backgroundColor: safeRoleColor.bg, color: safeRoleColor.text, fontWeight: 'bold', fontSize: '2rem', border: `3px solid ${safeRoleColor.text}` }}>
            {!hasPortrait && firstChar}
          </Avatar>
          <Box>
            <Typography variant="h5" component="span" sx={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{figure.name}</Typography>
            {figure.courtesy && <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mt: 0.5 }}>字 {figure.courtesy}</Typography>}
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
              <Chip label={roleLabel} size="small" sx={{ backgroundColor: safeRoleColor.bg, color: safeRoleColor.text, fontWeight: 500 }} />
              <Chip label={`${lifespan}（享年${age}岁）`} size="small" variant="outlined" sx={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }} />
              {figure.faction && <Chip label={figure.faction} size="small" variant="outlined" sx={{ borderColor: safeRoleColor.text, color: safeRoleColor.text }} />}
            </Box>
          </Box>
        </Box>
        <IconButton aria-label="关闭" onClick={onClose} sx={{ color: 'var(--color-text-secondary)' }}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        {figure.positions.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ color: 'var(--color-text-primary)', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon sx={{ fontSize: '1.2rem', color: safeRoleColor.text }} />担任职位
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {figure.positions.map((position, index) => <Chip key={index} label={position} size="small" variant="outlined" sx={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }} />)}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ color: 'var(--color-text-primary)', fontWeight: 600, mb: 1.5 }}>生平简介</Typography>
          <Typography variant="body1" sx={{ color: 'var(--color-text-primary)', lineHeight: 1.8, textAlign: 'justify' }}>{figure.biography}</Typography>
        </Box>

        {figure.politicalViews && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ color: 'var(--color-text-primary)', fontWeight: 600, mb: 1.5 }}>政治主张</Typography>
              <Box sx={{ p: 2, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-tertiary)', borderLeft: `3px solid ${safeRoleColor.text}` }}>
                <Typography variant="body1" sx={{ color: 'var(--color-text-primary)', lineHeight: 1.8 }}>{figure.politicalViews}</Typography>
              </Box>
            </Box>
          </>
        )}

        {figure.achievements.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ color: 'var(--color-text-primary)', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEventsIcon sx={{ fontSize: '1.2rem', color: '#ffc107' }} />主要成就
              </Typography>
              <List dense disablePadding>
                {figure.achievements.map((achievement, index) => (
                  <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                    <ListItemText primary={<Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 1 }}><span style={{ color: '#4caf50' }}>•</span>{achievement}</Typography>} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        )}

        {figure.events.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ color: 'var(--color-text-primary)', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon sx={{ fontSize: '1.2rem', color: '#2196f3' }} />参与的历史事件
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {figure.events.map((event, index) => (
                  <Box key={index} sx={{ p: 2, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{event.name}</Typography>
                      <Chip label={`${event.year}年`} size="small" sx={{ fontSize: '0.7rem', height: '20px', backgroundColor: 'rgba(33, 150, 243, 0.1)', color: '#2196f3' }} />
                      <Chip label={event.role} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: '20px', borderColor: safeRoleColor.text, color: safeRoleColor.text }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>{event.description}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        )}

        {figure.evaluations.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ color: 'var(--color-text-primary)', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MenuBookIcon sx={{ fontSize: '1.2rem', color: '#9c27b0' }} />历史评价
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {figure.evaluations.map((evaluation, index) => (
                  <Box key={index} sx={{ p: 2, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-tertiary)', borderLeft: `3px solid ${safeRoleColor.text}` }}>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-primary)', fontStyle: 'italic', lineHeight: 1.8, mb: 1 }}>"{evaluation.content}"</Typography>
                    <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>—— {evaluation.source}{evaluation.author && ` · ${evaluation.author}`}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        )}

        {figure.sources.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'var(--color-text-secondary)', mb: 1 }}>参考资料</Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{figure.sources.join('、')}</Typography>
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

export default YuanFigureDetailModal;
