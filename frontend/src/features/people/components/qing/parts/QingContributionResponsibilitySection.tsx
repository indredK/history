/**
 * 对清朝兴衰的贡献与责任 —— 双栏块
 */

import { Box, Divider, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface QingContributionResponsibilitySectionProps {
  contribution: string;
  responsibility: string;
}

export function QingContributionResponsibilitySection({
  contribution,
  responsibility,
}: QingContributionResponsibilitySectionProps) {
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
          <TrendingUpIcon sx={{ fontSize: '1.2rem', color: '#4caf50' }} />
          对清朝兴衰的贡献
        </Typography>
        <Box
          sx={{
            p: 2,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-tertiary)',
            borderLeft: '3px solid #4caf50',
          }}
        >
          <Typography
            variant="body1"
            sx={{ color: 'var(--color-text-primary)', lineHeight: 1.8 }}
          >
            {contribution}
          </Typography>
        </Box>
      </Box>

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
          <TrendingDownIcon sx={{ fontSize: '1.2rem', color: '#f44336' }} />
          对清朝兴衰的责任
        </Typography>
        <Box
          sx={{
            p: 2,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-tertiary)',
            borderLeft: '3px solid #f44336',
          }}
        >
          <Typography
            variant="body1"
            sx={{ color: 'var(--color-text-primary)', lineHeight: 1.8 }}
          >
            {responsibility}
          </Typography>
        </Box>
      </Box>
    </>
  );
}
