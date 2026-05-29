/**
 * 政治举措列表
 */

import { Box, Chip, Divider, Typography } from '@mui/material';
import PolicyIcon from '@mui/icons-material/Policy';
import type { PolicyMeasure } from '@/services/person/qing/types';

interface QingPoliciesSectionProps {
  policies: PolicyMeasure[];
}

export function QingPoliciesSection({ policies }: QingPoliciesSectionProps) {
  if (policies.length === 0) return null;

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
          <PolicyIcon sx={{ fontSize: '1.2rem', color: 'var(--color-info)' }} />
          政治举措
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {policies.map((policy, index) => (
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
                  {policy.name}
                </Typography>
                {policy.year && (
                  <Chip
                    label={`${policy.year}年`}
                    size="small"
                    sx={{
                      fontSize: '0.7rem',
                      height: '20px',
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      color: 'var(--color-info)',
                    }}
                  />
                )}
              </Box>
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mb: 1 }}>
                {policy.description}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
              >
                影响：{policy.impact}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
}
