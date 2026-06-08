import { type ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface ThemeColor {
  bg: string;
  text: string;
}

export interface DynastyFigureData {
  name: string;
  courtesy?: string;
  portraitUrl?: string;
  role: string;
  faction?: string;
  positions: string[];
  biography?: string;
  birthYear?: number | null;
  deathYear?: number | null;
  achievements?: string[];
  evaluations?: Array<{ source: string; content: string; author?: string }>;
  events?: Array<{ name: string; year: number; role?: string; description?: string }>;
  politicalViews?: string;
  sources?: string[];
}

interface BaseFigureDetailModalProps<T extends DynastyFigureData> {
  figure: T | null;
  open: boolean;
  onClose: () => void;
  themeColor: ThemeColor;
  headerChips?: ReactNode;
  ariaIdPrefix?: string;
}

export function formatLifespan(figure: DynastyFigureData): string {
  const birthKnown = isKnownHistoricalYear(figure.birthYear);
  const deathKnown = isKnownHistoricalYear(figure.deathYear);

  if (!birthKnown && !deathKnown) return '生卒不详';

  const birthYear = birthKnown ? formatHistoricalYear(figure.birthYear) : '生年不详';
  const deathYear = deathKnown ? formatHistoricalYear(figure.deathYear) : '卒年不详';

  return `${birthYear} - ${deathYear}`;
}

export function calculateAge(figure: DynastyFigureData): number | null {
  if (!isKnownHistoricalYear(figure.birthYear) || !isKnownHistoricalYear(figure.deathYear)) {
    return null;
  }
  if (figure.deathYear < figure.birthYear) return null;
  return figure.deathYear - figure.birthYear;
}

export function formatLifespanWithAge(figure: DynastyFigureData): string {
  const lifespan = formatLifespan(figure);
  const age = calculateAge(figure);
  return age === null ? lifespan : `${lifespan}（享年${age}岁）`;
}

export function formatHistoricalYear(year: number | null | undefined): string {
  if (!isKnownHistoricalYear(year)) return '年份不详';
  return year < 0 ? `公元前${Math.abs(year)}年` : `${year}年`;
}

function isKnownHistoricalYear(year: number | null | undefined): year is number {
  return typeof year === 'number' && Number.isFinite(year) && year !== 0;
}

export function BaseFigureDetailModal<T extends DynastyFigureData>({
  figure,
  open,
  onClose,
  themeColor,
  headerChips,
  ariaIdPrefix = 'figure',
}: BaseFigureDetailModalProps<T>) {
  if (!figure) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby={`${ariaIdPrefix}-detail-title`}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        <Typography variant="h6" component="span" id={`${ariaIdPrefix}-detail-title`}>
          {figure.name}
          {figure.courtesy && (
            <Typography variant="body2" component="span" color="text.secondary" sx={{ ml: 1 }}>
              字 {figure.courtesy}
            </Typography>
          )}
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label="关闭">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {headerChips && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {headerChips}
          </Box>
        )}

        {figure.biography && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              生平简介
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {figure.biography}
            </Typography>
          </Box>
        )}

        {figure.positions.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              主要职务
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {figure.positions.map((pos, i) => (
                <Chip key={i} label={pos} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        {figure.achievements && figure.achievements.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              主要成就
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {figure.achievements.map((a, i) => (
                <Chip key={i} label={a} size="small" />
              ))}
            </Box>
          </Box>
        )}

        {figure.evaluations && figure.evaluations.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              历史评价
            </Typography>
            {figure.evaluations.map((evalItem, i) => (
              <Box key={i} sx={{ mb: 1, pl: 1, borderLeft: `3px solid ${themeColor.text}` }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  {evalItem.content}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  —— {evalItem.source}{evalItem.author ? ` (${evalItem.author})` : ''}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {figure.events && figure.events.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              相关事件
            </Typography>
            {figure.events.map((event, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  {formatHistoricalYear(event.year)}
                </Typography>
                <Typography variant="body2">
                  {event.name}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
