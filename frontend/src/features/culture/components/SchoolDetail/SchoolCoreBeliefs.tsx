/**
 * 流派核心思想 chips
 */

import { Box, Chip, Typography } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import type { PhilosophicalSchool } from '@/services/school/types';

interface SchoolCoreBeliefsProps {
  school: PhilosophicalSchool;
}

export function SchoolCoreBeliefs({ school }: SchoolCoreBeliefsProps) {
  const ideas = school.coreBeliefs || school.coreIdeas || [];
  if (ideas.length === 0) return null;

  return (
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
        <LightbulbIcon sx={{ fontSize: '1.2rem', color: 'var(--color-warning)' }} />
        核心思想
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {ideas.map((idea, index) => (
          <Chip
            key={index}
            label={idea}
            sx={{
              backgroundColor: school.color
                ? `${school.color}15`
                : 'rgba(158, 158, 158, 0.1)',
              color: school.color || 'var(--color-text-primary)',
              fontWeight: 500,
              fontSize: '0.85rem',
              border: school.color
                ? `1px solid ${school.color}40`
                : '1px solid var(--color-border)',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
