import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import type {
  CommonPerson,
  CreateCommonPersonInput,
  PersonEvent,
  SourceRef,
} from '@/services/person/common';

type DialogMode = 'create' | 'edit';

interface PersonFormDialogProps {
  open: boolean;
  mode: DialogMode;
  person?: CommonPerson | null;
  saving?: boolean;
  error?: Error | null;
  onClose: () => void;
  onSave: (input: CreateCommonPersonInput, id?: string) => Promise<void>;
}

const emptyForm = {
  name: '',
  nameEn: '',
  courtesy: '',
  dynasty: '',
  period: '',
  gender: '',
  birthYear: '',
  birthMonth: '',
  deathYear: '',
  deathMonth: '',
  birthplace: '',
  biography: '',
  roles: '',
  aliases: '',
  achievements: '',
  works: '',
  events: '',
  sources: '',
  confidence: '',
};

const GENDER_OPTIONS = [
  { value: '', label: '未标注' },
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
];

function lines(value: unknown): string {
  if (!Array.isArray(value)) return '';
  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      if (!item || typeof item !== 'object') return '';
      const event = item as PersonEvent;
      return [
        event.year?.toString() || '',
        event.name || '',
        event.role || '',
        event.description || '',
      ].filter(Boolean).join(' | ');
    })
    .filter(Boolean)
    .join('\n');
}

function sourceLines(value: SourceRef[] | undefined): string {
  if (!Array.isArray(value)) return '';
  return value
    .map((source) =>
      [source.title, source.url || '', source.author || ''].filter(Boolean).join(' | '),
    )
    .join('\n');
}

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitTokens(value: string): string[] {
  return value
    .split(/[,，、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function optionalNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function clearableText(value: string): string {
  return value.trim();
}

function clearableNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function validatePersonInput(input: CreateCommonPersonInput): string | null {
  if (!input.name.trim()) {
    return '请填写人物姓名';
  }

  if (
    input.birthYear !== undefined
    && input.birthYear !== null
    && input.deathYear !== undefined
    && input.deathYear !== null
    && input.deathYear < input.birthYear
  ) {
    return '人物卒年不能早于生年';
  }

  if (
    input.confidence !== undefined
    && input.confidence !== null
    && (input.confidence < 0 || input.confidence > 1)
  ) {
    return '可信度必须在 0 到 1 之间';
  }

  return null;
}

function parseEvents(value: string): PersonEvent[] {
  return splitLines(value).map((line) => {
    const [year = '', name = '', role = '', description = ''] = line
      .split('|')
      .map((part) => part.trim());
    return {
      name: name || year,
      year: optionalNumber(name ? year : ''),
      role: optionalText(role),
      description: optionalText(description),
    };
  });
}

function parseSources(value: string): SourceRef[] {
  return splitLines(value).map((line) => {
    const [title = '', url = '', author = ''] = line
      .split('|')
      .map((part) => part.trim());
    return {
      title,
      url: optionalText(url),
      author: optionalText(author),
    };
  }).filter((source) => source.title);
}

function personToForm(person?: CommonPerson | null) {
  if (!person) return emptyForm;
  return {
    name: person.name || '',
    nameEn: person.nameEn || person.name_en || '',
    courtesy: person.courtesy || '',
    dynasty: person.dynasty || '',
    period: person.period || '',
    gender: person.gender || '',
    birthYear: person.birthYear?.toString() || '',
    birthMonth: person.birthMonth?.toString() || '',
    deathYear: person.deathYear?.toString() || '',
    deathMonth: person.deathMonth?.toString() || '',
    birthplace: person.birthplace || '',
    biography: person.biography || '',
    roles: (person.roles || []).join('，'),
    aliases: (person.aliases || []).join('，'),
    achievements: (person.achievements || []).join('\n'),
    works: (person.works || []).join('\n'),
    events: lines(person.events),
    sources: sourceLines(person.sources),
    confidence: person.confidence?.toString() || '',
  };
}

function renderGenderValue(value: unknown): string {
  const normalized = String(value ?? '');
  return GENDER_OPTIONS.find((option) => option.value === normalized)?.label ?? normalized;
}

export function PersonFormDialog({
  open,
  mode,
  person,
  saving = false,
  error,
  onClose,
  onSave,
}: PersonFormDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(personToForm(person));
      setFormError(null);
    }
  }, [open, person]);

  const title = useMemo(
    () => (mode === 'create' ? '新增人物档案' : `编辑 ${person?.name || ''}`),
    [mode, person?.name],
  );

  const update = (field: keyof typeof emptyForm) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSave = async () => {
    const input: CreateCommonPersonInput = {
      name: form.name.trim(),
      nameEn: clearableText(form.nameEn),
      courtesy: clearableText(form.courtesy),
      dynasty: clearableText(form.dynasty),
      period: clearableText(form.period),
      gender: clearableText(form.gender),
      birthYear: clearableNumber(form.birthYear),
      birthMonth: clearableNumber(form.birthMonth),
      deathYear: clearableNumber(form.deathYear),
      deathMonth: clearableNumber(form.deathMonth),
      birthplace: clearableText(form.birthplace),
      biography: clearableText(form.biography),
      roles: splitTokens(form.roles),
      aliases: splitTokens(form.aliases),
      achievements: splitLines(form.achievements),
      works: splitLines(form.works),
      events: parseEvents(form.events),
      sources: parseSources(form.sources),
      confidence: clearableNumber(form.confidence),
    };
    const validationError = validatePersonInput(input);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);
    await onSave(input, person?.id);
  };

  const visibleError = formError || error?.message;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      aria-labelledby="person-form-title"
      slotProps={{
        paper: {
          sx: {
            background: 'var(--color-bg-card)',
            borderRadius: fullScreen ? 0 : 'var(--radius-lg)',
          },
        },
      }}
    >
      <DialogTitle id="person-form-title">{title}</DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
            pt: 0.5,
          }}
        >
          <TextField label="姓名" value={form.name} onChange={update('name')} required />
          <TextField label="英文名" value={form.nameEn} onChange={update('nameEn')} />
          <TextField label="字/号" value={form.courtesy} onChange={update('courtesy')} />
          <TextField label="朝代" value={form.dynasty} onChange={update('dynasty')} />
          <TextField label="时期" value={form.period} onChange={update('period')} />
          <TextField
            select
            label="性别"
            value={form.gender}
            onChange={update('gender')}
            slotProps={{
              select: {
                renderValue: renderGenderValue,
              },
            }}
          >
            {GENDER_OPTIONS.map((option) => (
              <MenuItem key={option.value || 'unset'} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="生年" value={form.birthYear} onChange={update('birthYear')} type="number" />
          <TextField label="卒年" value={form.deathYear} onChange={update('deathYear')} type="number" />
          <TextField label="生月" value={form.birthMonth} onChange={update('birthMonth')} type="number" />
          <TextField label="卒月" value={form.deathMonth} onChange={update('deathMonth')} type="number" />
          <TextField label="籍贯" value={form.birthplace} onChange={update('birthplace')} />
          <TextField label="可信度" value={form.confidence} onChange={update('confidence')} type="number" />
          <TextField
            label="角色"
            value={form.roles}
            onChange={update('roles')}
            sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}
          />
          <TextField
            label="别名"
            value={form.aliases}
            onChange={update('aliases')}
            sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}
          />
          <TextField
            label="生平"
            value={form.biography}
            onChange={update('biography')}
            multiline
            minRows={4}
            sx={{ gridColumn: '1 / -1' }}
          />
          <TextField
            label="主要成就"
            value={form.achievements}
            onChange={update('achievements')}
            multiline
            minRows={3}
            sx={{ gridColumn: '1 / -1' }}
          />
          <TextField
            label="代表作品"
            value={form.works}
            onChange={update('works')}
            multiline
            minRows={3}
            sx={{ gridColumn: '1 / -1' }}
          />
          <TextField
            label="相关事件"
            value={form.events}
            onChange={update('events')}
            multiline
            minRows={3}
            sx={{ gridColumn: '1 / -1' }}
          />
          <TextField
            label="资料来源"
            value={form.sources}
            onChange={update('sources')}
            multiline
            minRows={3}
            sx={{ gridColumn: '1 / -1' }}
          />
        </Box>
        {visibleError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {visibleError}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          取消
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !form.name.trim()}
          variant="contained"
          startIcon={<SaveIcon />}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PersonFormDialog;
