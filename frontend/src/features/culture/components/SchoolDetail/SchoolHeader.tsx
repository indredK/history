/**
 * 流派详情弹窗标题栏 —— 头像 + 名称 + 创始人/创立时期 chips
 */

import { Avatar, Box, Chip, DialogTitle, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { PhilosophicalSchool } from '@/services/school/types';

interface SchoolHeaderProps {
  school: PhilosophicalSchool;
  onClose: () => void;
}

function isKnownFoundingYear(year: number | null | undefined): year is number {
  return typeof year === 'number' && Number.isFinite(year) && year !== 0;
}

function formatYear(year: number): string {
  if (year < 0) return `公元前${Math.abs(year)}年`;
  return `公元${year}年`;
}

export function SchoolHeader({ school, onClose }: SchoolHeaderProps) {
  const firstChar = school.name.charAt(0);
  const foundingYear = school.foundingYear;
  const hasFoundingYear = isKnownFoundingYear(foundingYear);
  const foundingTimeLabel = school.foundingPeriod
    || (hasFoundingYear ? formatYear(foundingYear) : '');

  return (
    <DialogTitle
      id="school-detail-title"
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        pb: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          alt={school.name}
          sx={{
            width: 64,
            height: 64,
            backgroundColor: school.color || 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            fontWeight: 'bold',
            fontSize: '1.5rem',
          }}
        >
          {firstChar}
        </Avatar>

        <Box>
          <Typography
            variant="h5"
            component="span"
            sx={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}
          >
            {school.name}
          </Typography>
          {school.name_en && (
            <Typography
              variant="body2"
              sx={{ color: 'var(--color-text-secondary)', mt: 0.5 }}
            >
              {school.name_en}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
            {school.founder && (
              <Chip
                label={`创始人: ${school.founder}`}
                size="small"
                sx={{
                  backgroundColor: school.color
                    ? `${school.color}20`
                    : 'rgba(158, 158, 158, 0.15)',
                  color: school.color || 'var(--color-text-secondary)',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                }}
              />
            )}
            {foundingTimeLabel && (
              <Chip
                label={foundingTimeLabel}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.75rem',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      <IconButton
        aria-label="关闭"
        onClick={onClose}
        sx={{ color: 'var(--color-text-secondary)' }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  );
}
