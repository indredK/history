import { Box, Paper, Typography, Button } from '@mui/material';
import { StarOutline, Star, Share, Info } from '@mui/icons-material';
import type { Event } from '../../../../../services/timeline/types';

interface EventDetailPanelProps {
  event: Event;
  isFavorite: boolean;
  onToggleFavorite: (eventId: string) => void;
  onShare: (event: Event) => void;
}

export function EventDetailPanel({ event, isFavorite, onToggleFavorite, onShare }: EventDetailPanelProps) {
  return (
    <Paper 
      sx={{ 
        mt: 2, 
        p: 2, 
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
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
            startIcon={isFavorite ? <Star sx={{ color: '#ffd700' }} /> : <StarOutline />}
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
        {event.startYear}
        {event.endYear && event.endYear !== event.startYear && 
          ` - ${event.endYear}`}年
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