import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import type { Mythology, MythologyCategory, MythologyInput } from '@/services/mythology';
import { VALID_CATEGORIES } from '@/services/mythology';

type MythologyFormMode = 'create' | 'edit';

interface MythologyFormDialogProps {
  open: boolean;
  mode: MythologyFormMode;
  mythology: Mythology | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: MythologyInput) => void;
}

interface MythologyFormState {
  title: string;
  englishTitle: string;
  category: MythologyCategory;
  period: string;
  source: string;
  description: string;
  characters: string;
  stories: string;
  symbolism: string;
  imageUrl: string;
}

const emptyForm: MythologyFormState = {
  title: '',
  englishTitle: '',
  category: '创世神话',
  period: '',
  source: '',
  description: '',
  characters: '',
  stories: '',
  symbolism: '',
  imageUrl: '',
};

function joinList(items?: string[]) {
  return items?.join('\n') || '';
}

function parseList(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[\n,，、]/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  );
}

function buildFormState(mythology: Mythology | null): MythologyFormState {
  if (!mythology) {
    return emptyForm;
  }

  return {
    title: mythology.title,
    englishTitle: mythology.englishTitle || '',
    category: mythology.category,
    period: mythology.period || '',
    source: mythology.source || mythology.origin || '',
    description: mythology.description,
    characters: joinList(mythology.characters),
    stories: joinList(mythology.stories),
    symbolism: joinList(mythology.symbolism),
    imageUrl: mythology.imageUrl || '',
  };
}

export function MythologyFormDialog({
  open,
  mode,
  mythology,
  saving,
  error,
  onClose,
  onSubmit,
}: MythologyFormDialogProps) {
  const [form, setForm] = useState<MythologyFormState>(emptyForm);

  useEffect(() => {
    if (open) {
      setForm(buildFormState(mythology));
    }
  }, [mythology, open]);

  const canSubmit = useMemo(
    () =>
      form.title.trim().length > 0 &&
      form.description.trim().length > 0 &&
      VALID_CATEGORIES.includes(form.category),
    [form.category, form.description, form.title],
  );

  const handleSubmit = () => {
    const input: MythologyInput = {
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
    };
    const englishTitle = form.englishTitle.trim();
    const period = form.period.trim();
    const source = form.source.trim();
    const imageUrl = form.imageUrl.trim();
    const characters = parseList(form.characters);
    const stories = parseList(form.stories);
    const symbolism = parseList(form.symbolism);

    input.englishTitle = englishTitle;
    input.period = period;
    input.source = source;
    input.origin = source;
    input.imageUrl = imageUrl;
    input.characters = characters;
    input.stories = stories;
    input.symbolism = symbolism;

    onSubmit(input);
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            background: 'var(--app-panel-bg)',
            border: 'var(--app-panel-border)',
            borderRadius: 'var(--radius-unified-lg)',
          },
        },
      }}
    >
      <DialogTitle sx={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>
        {mode === 'create' ? '新增神话' : '编辑神话'}
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: 'var(--color-border)' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
            pt: 0.5,
          }}
        >
          <TextField
            label="中文标题"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            fullWidth
            required
          />
          <TextField
            label="英文标题"
            value={form.englishTitle}
            onChange={(event) => setForm((prev) => ({ ...prev, englishTitle: event.target.value }))}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="mythology-category-label">分类</InputLabel>
            <Select
              labelId="mythology-category-label"
              label="分类"
              value={form.category}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  category: event.target.value as MythologyCategory,
                }))
              }
            >
              {VALID_CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="时期"
            value={form.period}
            onChange={(event) => setForm((prev) => ({ ...prev, period: event.target.value }))}
            fullWidth
          />
          <TextField
            label="出处"
            value={form.source}
            onChange={(event) => setForm((prev) => ({ ...prev, source: event.target.value }))}
            fullWidth
          />
          <TextField
            label="图片地址"
            value={form.imageUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
            fullWidth
          />
          <TextField
            label="故事描述"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            fullWidth
            multiline
            minRows={4}
            required
            sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
          />
          <TextField
            label="相关人物"
            value={form.characters}
            onChange={(event) => setForm((prev) => ({ ...prev, characters: event.target.value }))}
            fullWidth
            multiline
            minRows={3}
          />
          <TextField
            label="故事要点"
            value={form.stories}
            onChange={(event) => setForm((prev) => ({ ...prev, stories: event.target.value }))}
            fullWidth
            multiline
            minRows={3}
          />
          <TextField
            label="象征含义"
            value={form.symbolism}
            onChange={(event) => setForm((prev) => ({ ...prev, symbolism: event.target.value }))}
            fullWidth
            multiline
            minRows={3}
            sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          取消
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={!canSubmit || saving}
          onClick={handleSubmit}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MythologyFormDialog;
