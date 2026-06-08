import { Box, Paper, Typography, Button } from '@mui/material';
import { StarOutlined, Star, Share, Info } from '@mui/icons-material';
import type { Event } from '@/services/timeline/types';
import { formatTimelineYear } from '@/features/timeline/utils/dynastyUtils';

interface EventDetailPanelProps {
  event: Event;
  isFavorite: boolean;
  onToggleFavorite: (eventId: string) => void;
  onShare: (event: Event) => void;
}

export function EventDetailPanel({ event, isFavorite, onToggleFavorite, onShare }: EventDetailPanelProps) {
  const yearLabel =
    event.endYear !== undefined && event.endYear !== null && event.endYear !== event.startYear
      ? `${formatTimelineYear(event.startYear)} - ${formatTimelineYear(event.endYear)}`
      : formatTimelineYear(event.startYear);

  return (
    <Paper 
      sx={{ 
        mt: 2, 
        p: 2, 
        backgroundColor: 'rgba(var(--glass-surface-rgb), 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--theme-glass-border)',
        maxHeight: '200px',
        overflow: 'auto'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
          {event.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            startIcon={isFavorite ? <Star sx={{ color: 'var(--color-accent, #ffd700)' }} /> : <StarOutlined />}
            onClick={() => onToggleFavorite(event.id)}
          />
          <Button
            size="small"
            startIcon={<Share />}
            onClick={() => onShare(event)}
          />
        </Box>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {yearLabel}
      </Typography>
      
      {event.description && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          {event.description}
        </Typography>
      )}
      
      {event.startDate && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Info fontSize="small" />
          {event.startDate}
        </Typography>
      )}
    </Paper>
  );
}
