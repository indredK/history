/**
 * 历史评价列表
 */

import { Box, Divider, Typography } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import type { HistoricalEvaluation } from '@/services/person/qing/types';
import type { PeriodColor } from './period';

interface QingEvaluationsSectionProps {
  evaluations: HistoricalEvaluation[];
  periodColor: PeriodColor;
}

export function QingEvaluationsSection({
  evaluations,
  periodColor,
}: QingEvaluationsSectionProps) {
  if (evaluations.length === 0) return null;

  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Box>
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
          <MenuBookIcon sx={{ fontSize: '1.2rem', color: '#9c27b0' }} />
          历史评价
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {evaluations.map((evaluation, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-tertiary)',
                borderLeft: `3px solid ${periodColor.text}`,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'var(--color-text-primary)',
                  fontStyle: 'italic',
                  lineHeight: 1.8,
                  mb: 1,
                }}
              >
                "{evaluation.content}"
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                —— {evaluation.source}
                {evaluation.author && ` · ${evaluation.author}`}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
}
