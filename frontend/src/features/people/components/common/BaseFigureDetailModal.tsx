/**
 * 朝代人物详情弹窗通用组件
 *
 * 抽取自 Tang/Song/Yuan/Ming/Sanguo 5 个高度重复的 FigureDetailModal:
 * 主体结构(Avatar + 头部 Chip + 担任职位 + 生平简介 + 政治主张 + 主要成就
 * + 历史事件 + 历史评价 + 参考资料)完全一致,差异点通过 props 注入。
 *
 * 差异点:
 * - themeColor: 主色(Tang/Song/Yuan/Ming 用 role 色, Sanguo 用 kingdom 色)
 * - headerChips: 标题区下方的 Chip 组(各朝代展示字段不同)
 * - ariaIdPrefix: 弹窗的 aria-labelledby 前缀
 */

import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  Box, Chip, IconButton, Avatar, Divider, List, ListItem, ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HistoryIcon from '@mui/icons-material/History';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WorkIcon from '@mui/icons-material/Work';

/** 历史事件 */
export interface HistoricalEvent {
  name: string;
  year: number;
  role: string;
  description: string;
}

/** 历史评价 */
export interface HistoricalEvaluation {
  source: string;
  content: string;
  author?: string;
}

/** 通用人物字段子集 — 所有朝代 Figure 类型都满足此约束 */
export interface BaseFigure {
  id: string;
  name: string;
  courtesy?: string;
  birthYear: number;
  deathYear: number;
  positions: string[];
  biography: string;
  politicalViews?: string;
  achievements: string[];
  events: HistoricalEvent[];
  evaluations: HistoricalEvaluation[];
  portraitUrl?: string;
  sources: string[];
}

export interface ThemeColor {
  bg: string;
  text: string;
}

export interface BaseFigureDetailModalProps<F extends BaseFigure> {
  figure: F | null;
  open: boolean;
  onClose: () => void;
  /** 主色 — 用于 Avatar/Divider/Position 标题/Event chip 等 */
  themeColor: ThemeColor;
  /** 标题区下方的 Chip 组(由 wrapper 根据朝代差异渲染) */
  headerChips: React.ReactNode;
  /** 弹窗 aria 前缀, e.g. "tang", "sanguo" */
  ariaIdPrefix: string;
}

/** 默认计算 lifespan/age 的辅助函数 */
export function formatLifespan(figure: BaseFigure): string {
  return `${figure.birthYear}年 - ${figure.deathYear}年`;
}

export function calculateAge(figure: BaseFigure): number {
  return figure.deathYear - figure.birthYear;
}

export function BaseFigureDetailModal<F extends BaseFigure>({
  figure,
  open,
  onClose,
  themeColor,
  headerChips,
  ariaIdPrefix,
}: BaseFigureDetailModalProps<F>) {
  if (!figure) return null;

  const hasPortrait = !!(figure.portraitUrl && figure.portraitUrl.trim() !== '');
  const firstChar = figure.name.charAt(0);
  const titleId = `${ariaIdPrefix}-figure-detail-title`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby={titleId}
      slotProps={{ paper: { sx: { background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', maxHeight: '90vh' } } }}
    >
      <DialogTitle id={titleId} sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            {...(hasPortrait ? { src: figure.portraitUrl } : {})}
            alt={figure.name}
            sx={{ width: 72, height: 72, backgroundColor: themeColor.bg, color: themeColor.text, fontWeight: 'bold', fontSize: '2rem', border: `3px solid ${themeColor.text}` }}
          >
            {!hasPortrait && firstChar}
          </Avatar>
          <Box>
            <Typography variant="h5" component="span" sx={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
              {figure.name}
            </Typography>
            {figure.courtesy && (
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mt: 0.5 }}>
                字 {figure.courtesy}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
              {headerChips}
            </Box>
          </Box>
        </Box>
        <IconButton aria-label="关闭" onClick={onClose} sx={{ color: 'var(--color-text-secondary)' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        {figure.positions.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ color: 'var(--color-text-primary)', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon sx={{ fontSize: '1.2rem', color: themeColor.text }} />担任职位
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {figure.positions.map((position, index) => (
                <Chip key={index} label={position} size="small" variant="outlined" sx={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }} />
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ color: 'var(--color-text-primary)', fontWeight: 600, mb: 1.5 }}>生平简介</Typography>
          <Typography variant="body1" sx={{ color: 'var(--color-text-primary)', lineHeight: 1.8, textAlign: 'justify' }}>
            {figure.biography}
          </Typography>
        </Box>

        {figure.politicalViews && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ color: 'var(--color-text-primary)', fontWeight: 600, mb: 1.5 }}>政治主张</Typography>
              <Box sx={{ p: 2, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-tertiary)', borderLeft: `3px solid ${themeColor.text}` }}>
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
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <span style={{ color: '#4caf50' }}>•</span>
                          {achievement}
                        </Typography>
                      }
                    />
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
                      <Chip label={event.role} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: '20px', borderColor: themeColor.text, color: themeColor.text }} />
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
                  <Box key={index} sx={{ p: 2, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-tertiary)', borderLeft: `3px solid ${themeColor.text}` }}>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-primary)', fontStyle: 'italic', lineHeight: 1.8, mb: 1 }}>
                      &quot;{evaluation.content}&quot;
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                      —— {evaluation.source}{evaluation.author && ` · ${evaluation.author}`}
                    </Typography>
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
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                {figure.sources.join('、')}
              </Typography>
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
