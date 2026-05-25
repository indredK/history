/**
 * 流派经典著作 —— 优先用详细的 classicWorks,退回简单的 keyTexts
 */

import { Box, Typography } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import type { PhilosophicalSchool } from '@/services/school/types';

interface SchoolWorksProps {
  school: PhilosophicalSchool;
}

export function SchoolWorks({ school }: SchoolWorksProps) {
  const hasClassicWorks = school.classicWorks && school.classicWorks.length > 0;
  const hasKeyTexts = school.keyTexts && school.keyTexts.length > 0;
  if (!hasClassicWorks && !hasKeyTexts) return null;

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
        <MenuBookIcon sx={{ fontSize: '1.2rem', color: '#4caf50' }} />
        经典著作
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {hasClassicWorks
          ? school.classicWorks!.map((work) => (
              <Box
                key={work.id}
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
                    《{work.title}》
                  </Typography>
                  {work.title_en && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'var(--color-text-secondary)' }}
                    >
                      {work.title_en}
                    </Typography>
                  )}
                </Box>

                {work.author && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: school.color || 'var(--color-primary)',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    作者: {work.author}
                  </Typography>
                )}

                {work.description && (
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                    {work.description}
                  </Typography>
                )}
              </Box>
            ))
          : school.keyTexts?.map((text, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}
                >
                  {text}
                </Typography>
              </Box>
            ))}
      </Box>
    </Box>
  );
}
