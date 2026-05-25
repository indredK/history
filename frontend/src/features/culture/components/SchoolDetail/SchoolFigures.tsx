/**
 * 流派代表人物列表
 */

import {
  Avatar,
  Box,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import type { PhilosophicalSchool } from '@/services/school/types';

interface SchoolFiguresProps {
  school: PhilosophicalSchool;
}

export function SchoolFigures({ school }: SchoolFiguresProps) {
  const figures = school.representativeFigures;
  if (!figures || figures.length === 0) return null;

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
        <PersonIcon sx={{ fontSize: '1.2rem', color: '#2196f3' }} />
        代表人物
      </Typography>
      <List dense disablePadding>
        {figures.map((figure) => (
          <ListItem
            key={figure.id}
            sx={{
              py: 1,
              px: 2,
              mb: 1,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  backgroundColor: school.color || 'var(--color-primary)',
                  color: '#fff',
                  width: 36,
                  height: 36,
                  fontSize: '0.9rem',
                }}
              >
                {figure.name.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}
                  >
                    {figure.name}
                  </Typography>
                  {figure.name_en && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'var(--color-text-secondary)' }}
                    >
                      {figure.name_en}
                    </Typography>
                  )}
                  {figure.period && (
                    <Chip
                      label={figure.period}
                      size="small"
                      sx={{
                        fontSize: '0.65rem',
                        height: '18px',
                        backgroundColor: 'var(--color-bg-secondary)',
                      }}
                    />
                  )}
                </Box>
              }
              secondary={
                figure.contribution && (
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--color-text-secondary)', mt: 0.5 }}
                  >
                    {figure.contribution}
                  </Typography>
                )
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
