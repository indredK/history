import type { ReactNode } from 'react';
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Link,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { CommonPerson } from '@/services/person/common';
import {
  formatLifespan,
  formatSource,
  getRoleColor,
  getRoleLabel,
} from './personArchiveUtils';

interface PersonDetailModalProps {
  person: CommonPerson | null;
  open: boolean;
  onClose: () => void;
  onEdit: (person: CommonPerson) => void;
  onDelete: (person: CommonPerson) => void;
}

interface DetailSectionProps {
  title: string;
  children: ReactNode;
}

function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{ color: 'var(--color-text-primary)', fontWeight: 700, mb: 1 }}
        >
          {title}
        </Typography>
        {children}
      </Box>
    </>
  );
}

export function PersonDetailModal({
  person,
  open,
  onClose,
  onEdit,
  onDelete,
}: PersonDetailModalProps) {
  if (!person) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="person-detail-title"
      slotProps={{
        paper: {
          sx: {
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            maxHeight: '90vh',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            id="person-detail-title"
            component="span"
            sx={{
              display: 'block',
              color: 'var(--color-text-primary)',
              fontSize: { xs: '1.15rem', md: '1.35rem' },
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            {person.name}
          </Typography>
          <Typography
            component="span"
            sx={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}
          >
            {[
              person.courtesy ? `字 ${person.courtesy}` : '',
              person.nameEn || person.name_en || '',
              person.dynasty || '',
            ].filter(Boolean).join(' · ')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexShrink: 0, gap: 0.5 }}>
          <Tooltip title="编辑">
            <IconButton
              size="small"
              aria-label={`编辑${person.name}`}
              onClick={() => onEdit(person)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="删除">
            <IconButton
              size="small"
              aria-label={`删除${person.name}`}
              onClick={() => onDelete(person)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="关闭">
            <IconButton size="small" aria-label="关闭" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2.5 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 1.25,
            mb: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
            生卒：{formatLifespan(person)}
          </Typography>
          {person.birthplace && (
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
              籍贯：{person.birthplace}
            </Typography>
          )}
          {person.period && (
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
              时期：{person.period}
            </Typography>
          )}
          {person.confidence !== undefined && (
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
              可信度：{Math.round(person.confidence * 100)}%
            </Typography>
          )}
        </Box>

        {person.roles && person.roles.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2 }}>
            {person.roles.map((role) => {
              const color = getRoleColor(role);
              return (
                <Chip
                  key={role}
                  label={getRoleLabel(role)}
                  size="small"
                  sx={{ backgroundColor: color.bg, color: color.text, fontWeight: 600 }}
                />
              );
            })}
          </Box>
        )}

        {person.biography && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body1"
              sx={{
                color: 'var(--color-text-primary)',
                lineHeight: 1.85,
                textAlign: 'justify',
              }}
            >
              {person.biography}
            </Typography>
          </Box>
        )}

        {person.achievements && person.achievements.length > 0 && (
          <DetailSection title="主要成就">
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {person.achievements.map((achievement) => (
                <Chip key={achievement} label={achievement} size="small" />
              ))}
            </Box>
          </DetailSection>
        )}

        {person.works && person.works.length > 0 && (
          <DetailSection title="代表作品">
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {person.works.map((work) => (
                <Chip key={work} label={work} size="small" variant="outlined" />
              ))}
            </Box>
          </DetailSection>
        )}

        {person.events && person.events.length > 0 && (
          <DetailSection title="相关事件">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {person.events.map((event, index) => (
                <Box
                  key={`${event.name}-${index}`}
                  sx={{ borderLeft: '3px solid var(--color-primary)', pl: 1.25 }}
                >
                  <Typography sx={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                    {event.year ? `${event.year}年 · ` : ''}{event.name}
                  </Typography>
                  {(event.role || event.description) && (
                    <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                      {[event.role, event.description].filter(Boolean).join('：')}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </DetailSection>
        )}

        {person.sources && person.sources.length > 0 && (
          <DetailSection title="资料来源">
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {person.sources.map((source, index) =>
                source.url ? (
                  <Link
                    key={`${source.title}-${index}`}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {formatSource(source)}
                  </Link>
                ) : (
                  <Chip
                    key={`${source.title}-${index}`}
                    label={formatSource(source)}
                    size="small"
                    variant="outlined"
                  />
                ),
              )}
            </Box>
          </DetailSection>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PersonDetailModal;
