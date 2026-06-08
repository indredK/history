import { Box, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { PersonCard } from '@/components/common';
import type { CommonPerson } from '@/services/person/common';
import {
  DEFAULT_PERSON_COLOR,
  formatLifespan,
  getPrimaryRole,
  getRoleColor,
  getRoleLabel,
} from './personArchiveUtils';

interface PersonArchiveCardProps {
  person: CommonPerson;
  onClick: (person: CommonPerson) => void;
  onEdit: (person: CommonPerson) => void;
  onDelete: (person: CommonPerson) => void;
}

export function PersonArchiveCard({
  person,
  onClick,
  onEdit,
  onDelete,
}: PersonArchiveCardProps) {
  const primaryRole = getPrimaryRole(person);
  const primaryColor = getRoleColor(primaryRole);
  const secondaryTags = [
    ...(person.dynasty
      ? [{ label: person.dynasty, color: DEFAULT_PERSON_COLOR, variant: 'outlined' as const }]
      : []),
    ...(person.roles ?? []).slice(1, 3).map((role) => ({
      label: getRoleLabel(role),
      color: getRoleColor(role),
    })),
  ];

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
          display: 'flex',
          gap: 0.5,
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Tooltip title="编辑">
          <IconButton
            size="small"
            aria-label={`编辑${person.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onEdit(person);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="删除">
          <IconButton
            size="small"
            aria-label={`删除${person.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onDelete(person);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <PersonCard
        name={person.name}
        subtitle={[
          person.courtesy ? `字 ${person.courtesy}` : '',
          person.nameEn || person.name_en || '',
        ].filter(Boolean).join(' · ')}
        portraitUrl={person.portraitUrl ?? undefined}
        primaryTag={{
          label: getRoleLabel(primaryRole),
          color: primaryColor,
        }}
        secondaryTags={secondaryTags}
        infoLines={[
          { label: '生卒：', value: formatLifespan(person) },
          ...(person.birthplace
            ? [{ label: '籍贯：', value: person.birthplace, truncate: true }]
            : []),
        ]}
        biography={person.biography ?? undefined}
        onClick={() => onClick(person)}
        avatarColor={primaryColor}
      />
    </Box>
  );
}

export default PersonArchiveCard;
