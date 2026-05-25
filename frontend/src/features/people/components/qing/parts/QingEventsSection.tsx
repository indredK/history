/**
 * 重大历史事件列表
 */

import { Box, Chip, Divider, Typography } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import type { HistoricalEvent } from '@/services/person/qing/types';
import type { PeriodColor } from './period';

interface QingEventsSectionProps {
  events: HistoricalEvent[];
  periodColor: PeriodColor;
}

export function QingEventsSection({ events, periodColor }: QingEventsSectionProps) {
  if (events.length === 0) return null;

  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle1"
          sx={{
            color: 'var(--color-text-primary)',
            fontWeight: 600,
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <HistoryIcon sx={{ fontSize: '1.2rem', color: '#ff9800' }} />
          重大历史事件
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {events.map((event, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}
                >
                  {event.name}
                </Typography>
                <Chip
                  label={`${event.year}年`}
                  size="small"
                  sx={{
                    fontSize: '0.7rem',
                    height: '20px',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    color: '#ff9800',
                  }}
                />
                <Chip
                  label={event.role}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '0.7rem',
                    height: '20px',
                    borderColor: periodColor.text,
                    color: periodColor.text,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                {event.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
}
