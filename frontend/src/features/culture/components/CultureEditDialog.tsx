import { useEffect, useMemo, useState } from 'react';
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
  PhilosophicalSchool,
  PhilosophicalSchoolMutationInput,
} from '@/services/school/types';
import type {
  Scholar,
  ScholarMutationInput,
  LiteraryWorkType,
} from '@/services/person/scholars/types';

type CultureEntity = 'school' | 'scholar';
type DialogMode = 'create' | 'edit';

interface CultureEditDialogProps {
  open: boolean;
  entity: CultureEntity;
  mode: DialogMode;
  school?: PhilosophicalSchool | null;
  scholar?: Scholar | null;
  schools: PhilosophicalSchool[];
  saving?: boolean;
  error?: Error | null;
  onClose: () => void;
  onSaveSchool: (
    input: PhilosophicalSchoolMutationInput,
    id?: string,
  ) => Promise<void>;
  onSaveScholar: (input: ScholarMutationInput, id?: string) => Promise<void>;
}

const emptySchoolForm = {
  name: '',
  name_en: '',
  founder: '',
  founderEn: '',
  foundingYear: '',
  foundingPeriod: '',
  coreBeliefs: '',
  keyTexts: '',
  representativeFigures: '',
  classicWorks: '',
  description: '',
  influence: '',
  color: '',
  sources: '',
};

const emptyScholarForm = {
  name: '',
  name_en: '',
  dynasty: '',
  dynastyPeriod: '',
  birthYear: '',
  deathYear: '',
  schoolOfThought: '',
  biography: '',
  achievements: '',
  majorWorks: '',
  portraitUrl: '',
  sources: '',
};

function lines(value: unknown): string {
  if (!Array.isArray(value)) return '';
  return value
    .map((item) => (typeof item === 'string' ? item : ''))
    .filter(Boolean)
    .join('\n');
}

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function clearableText(value: string): string {
  return value.trim();
}

function clearableNumber(value: string): number | null {
  if (value.trim() === '') return null;
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
}

function isInvalidNumber(value: string): boolean {
  return value.trim() !== '' && !Number.isFinite(Number(value));
}

function validateSchoolForm(form: typeof emptySchoolForm): string | null {
  if (!form.name.trim()) {
    return '请填写思想流派名称';
  }

  if (isInvalidNumber(form.foundingYear)) {
    return '创立年份必须是有效数字';
  }

  return null;
}

function validateScholarForm(form: typeof emptyScholarForm): string | null {
  if (!form.name.trim()) {
    return '请填写文化名人姓名';
  }

  if (isInvalidNumber(form.birthYear) || isInvalidNumber(form.deathYear)) {
    return '生年和卒年必须是有效数字';
  }

  const birthYear = clearableNumber(form.birthYear);
  const deathYear = clearableNumber(form.deathYear);
  if (birthYear !== null && deathYear !== null && deathYear < birthYear) {
    return '文化名人卒年不能早于生年';
  }

  return null;
}

function schoolToForm(school?: PhilosophicalSchool | null) {
  if (!school) return emptySchoolForm;
  return {
    name: school.name || '',
    name_en: school.name_en || '',
    founder: school.founder || '',
    founderEn: school.founderEn || '',
    foundingYear: school.foundingYear?.toString() || '',
    foundingPeriod: school.foundingPeriod || '',
    coreBeliefs: lines(school.coreBeliefs),
    keyTexts: lines(school.keyTexts),
    representativeFigures: (school.representativeFigures || [])
      .map((figure) =>
        [figure.name, figure.period, figure.contribution]
          .filter(Boolean)
          .join(' | '),
      )
      .join('\n'),
    classicWorks: (school.classicWorks || [])
      .map((work) =>
        [work.title, work.author, work.description].filter(Boolean).join(' | '),
      )
      .join('\n'),
    description: school.description || '',
    influence: school.influence || '',
    color: school.color || '',
    sources: lines(school.sources),
  };
}

function scholarToForm(scholar?: Scholar | null) {
  if (!scholar) return emptyScholarForm;
  const works = [...(scholar.representativeWorks || []), ...(scholar.majorWorks || [])];
  return {
    name: scholar.name || '',
    name_en: scholar.name_en || '',
    dynasty: scholar.dynasty || '',
    dynastyPeriod: scholar.dynastyPeriod || '',
    birthYear: scholar.birthYear?.toString() || '',
    deathYear: scholar.deathYear?.toString() || '',
    schoolOfThought: scholar.schoolOfThought || '',
    biography: scholar.biography || '',
    achievements: lines(scholar.achievements || scholar.contributions),
    majorWorks: works
      .map((work) =>
        typeof work === 'string'
          ? work
          : [work.title, work.type, work.description, work.contentExcerpt]
              .filter(Boolean)
              .join(' | '),
      )
      .join('\n'),
    portraitUrl: scholar.portraitUrl || '',
    sources: lines(scholar.sources),
  };
}

function parseFigures(value: string) {
  return splitLines(value).map((line, index) => {
    const [name = '', period = '', contribution = ''] = line
      .split('|')
      .map((part) => part.trim());
    return {
      id: `figure_${index}_${name || 'unknown'}`,
      name,
      name_en: '',
      period,
      contribution,
    };
  });
}

function parseClassicWorks(value: string) {
  return splitLines(value).map((line, index) => {
    const [title = '', author = '', description = ''] = line
      .split('|')
      .map((part) => part.trim());
    return {
      id: `work_${index}_${title || 'unknown'}`,
      title,
      title_en: '',
      author,
      description,
    };
  });
}

function normalizeWorkType(value: string): LiteraryWorkType {
  const allowedTypes: LiteraryWorkType[] = [
    'prose',
    'poetry',
    'essay',
    'memorial',
  ];

  return allowedTypes.includes(value as LiteraryWorkType)
    ? (value as LiteraryWorkType)
    : 'essay';
}

function parseScholarWorks(value: string) {
  return splitLines(value).map((line, index) => {
    const parts = line.split('|').map((part) => part.trim());
    if (parts.length === 1) return parts[0];
    const [title = '', type = 'prose', description = '', contentExcerpt = ''] =
      parts;
    return {
      id: `scholar_work_${index}_${title || 'unknown'}`,
      title,
      type: normalizeWorkType(type),
      description,
      contentExcerpt,
    };
  });
}

export function CultureEditDialog({
  open,
  entity,
  mode,
  school,
  scholar,
  schools,
  saving = false,
  error,
  onClose,
  onSaveSchool,
  onSaveScholar,
}: CultureEditDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [schoolForm, setSchoolForm] = useState(emptySchoolForm);
  const [scholarForm, setScholarForm] = useState(emptyScholarForm);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSchoolForm(schoolToForm(school));
    setScholarForm(scholarToForm(scholar));
    setFormError(null);
  }, [open, school, scholar]);

  const schoolOptions = useMemo(
    () => [
      ...new Set(
        [...schools.map((item) => item.name), scholar?.schoolOfThought].filter(
          (name): name is string => Boolean(name),
        ),
      ),
    ],
    [schools, scholar?.schoolOfThought],
  );

  const isSchool = entity === 'school';
  const canSubmit = isSchool
    ? schoolForm.name.trim().length > 0
    : scholarForm.name.trim().length > 0;

  const handleSubmit = async () => {
    if (isSchool) {
      const validationError = validateSchoolForm(schoolForm);
      if (validationError) {
        setFormError(validationError);
        return;
      }

      setFormError(null);
      await onSaveSchool(
        {
          name: schoolForm.name.trim(),
          name_en: clearableText(schoolForm.name_en),
          founder: clearableText(schoolForm.founder),
          founderEn: clearableText(schoolForm.founderEn),
          foundingYear: clearableNumber(schoolForm.foundingYear),
          foundingPeriod: clearableText(schoolForm.foundingPeriod),
          coreBeliefs: splitLines(schoolForm.coreBeliefs),
          keyTexts: splitLines(schoolForm.keyTexts),
          representativeFigures: parseFigures(schoolForm.representativeFigures),
          classicWorks: parseClassicWorks(schoolForm.classicWorks),
          description: clearableText(schoolForm.description),
          influence: clearableText(schoolForm.influence),
          color: clearableText(schoolForm.color),
          sources: splitLines(schoolForm.sources),
        },
        mode === 'edit' ? school?.id : undefined,
      );
      return;
    }

    const validationError = validateScholarForm(scholarForm);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);
    await onSaveScholar(
      {
        name: scholarForm.name.trim(),
        name_en: clearableText(scholarForm.name_en),
        dynasty: clearableText(scholarForm.dynasty),
        dynastyPeriod: clearableText(scholarForm.dynastyPeriod),
        birthYear: clearableNumber(scholarForm.birthYear),
        deathYear: clearableNumber(scholarForm.deathYear),
        schoolOfThought: clearableText(scholarForm.schoolOfThought),
        biography: clearableText(scholarForm.biography),
        achievements: splitLines(scholarForm.achievements),
        contributions: splitLines(scholarForm.achievements),
        majorWorks: parseScholarWorks(scholarForm.majorWorks),
        portraitUrl: clearableText(scholarForm.portraitUrl),
        sources: splitLines(scholarForm.sources),
      },
      mode === 'edit' ? scholar?.id : undefined,
    );
  };

  const visibleError = formError || error?.message;

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'var(--color-bg-card)',
    },
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      slotProps={{
        paper: {
          sx: {
            background: 'var(--color-bg-card)',
            borderRadius: fullScreen ? 0 : 'var(--radius-lg)',
          },
        },
      }}
    >
      <DialogTitle sx={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>
        {mode === 'create' ? '新增' : '编辑'}
        {isSchool ? '思想流派' : '文化名人'}
      </DialogTitle>
      <DialogContent dividers>
        {visibleError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {visibleError}
          </Alert>
        )}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
            pt: 1,
          }}
        >
          {isSchool ? (
            <>
              <TextField label="名称" value={schoolForm.name} required sx={fieldSx} onChange={(event) => setSchoolForm((state) => ({ ...state, name: event.target.value }))} />
              <TextField label="英文名" value={schoolForm.name_en} sx={fieldSx} onChange={(event) => setSchoolForm((state) => ({ ...state, name_en: event.target.value }))} />
              <TextField label="创始人" value={schoolForm.founder} sx={fieldSx} onChange={(event) => setSchoolForm((state) => ({ ...state, founder: event.target.value }))} />
              <TextField label="创始人英文" value={schoolForm.founderEn} sx={fieldSx} onChange={(event) => setSchoolForm((state) => ({ ...state, founderEn: event.target.value }))} />
              <TextField label="创立年份" value={schoolForm.foundingYear} type="number" sx={fieldSx} onChange={(event) => setSchoolForm((state) => ({ ...state, foundingYear: event.target.value }))} />
              <TextField label="创立时期" value={schoolForm.foundingPeriod} sx={fieldSx} onChange={(event) => setSchoolForm((state) => ({ ...state, foundingPeriod: event.target.value }))} />
              <TextField label="主题色" value={schoolForm.color} sx={fieldSx} onChange={(event) => setSchoolForm((state) => ({ ...state, color: event.target.value }))} />
              <TextField label="核心思想" value={schoolForm.coreBeliefs} multiline minRows={3} sx={fieldSx} onChange={(event) => setSchoolForm((state) => ({ ...state, coreBeliefs: event.target.value }))} />
              <TextField label="经典文本" value={schoolForm.keyTexts} multiline minRows={3} sx={fieldSx} onChange={(event) => setSchoolForm((state) => ({ ...state, keyTexts: event.target.value }))} />
              <TextField label="代表人物" value={schoolForm.representativeFigures} multiline minRows={3} sx={fieldSx} onChange={(event) => setSchoolForm((state) => ({ ...state, representativeFigures: event.target.value }))} />
              <TextField label="经典著作" value={schoolForm.classicWorks} multiline minRows={3} sx={fieldSx} onChange={(event) => setSchoolForm((state) => ({ ...state, classicWorks: event.target.value }))} />
              <TextField label="资料来源" value={schoolForm.sources} multiline minRows={3} sx={fieldSx} onChange={(event) => setSchoolForm((state) => ({ ...state, sources: event.target.value }))} />
              <TextField label="简介" value={schoolForm.description} multiline minRows={4} sx={{ ...fieldSx, gridColumn: '1 / -1' }} onChange={(event) => setSchoolForm((state) => ({ ...state, description: event.target.value }))} />
              <TextField label="历史影响" value={schoolForm.influence} multiline minRows={4} sx={{ ...fieldSx, gridColumn: '1 / -1' }} onChange={(event) => setSchoolForm((state) => ({ ...state, influence: event.target.value }))} />
            </>
          ) : (
            <>
              <TextField label="姓名" value={scholarForm.name} required sx={fieldSx} onChange={(event) => setScholarForm((state) => ({ ...state, name: event.target.value }))} />
              <TextField label="英文名" value={scholarForm.name_en} sx={fieldSx} onChange={(event) => setScholarForm((state) => ({ ...state, name_en: event.target.value }))} />
              <TextField label="朝代" value={scholarForm.dynasty} sx={fieldSx} onChange={(event) => setScholarForm((state) => ({ ...state, dynasty: event.target.value }))} />
              <TextField label="时期" value={scholarForm.dynastyPeriod} sx={fieldSx} onChange={(event) => setScholarForm((state) => ({ ...state, dynastyPeriod: event.target.value }))} />
              <TextField label="生年" value={scholarForm.birthYear} type="number" sx={fieldSx} onChange={(event) => setScholarForm((state) => ({ ...state, birthYear: event.target.value }))} />
              <TextField label="卒年" value={scholarForm.deathYear} type="number" sx={fieldSx} onChange={(event) => setScholarForm((state) => ({ ...state, deathYear: event.target.value }))} />
              <TextField select label="学派" value={scholarForm.schoolOfThought} sx={fieldSx} onChange={(event) => setScholarForm((state) => ({ ...state, schoolOfThought: event.target.value }))}>
                <MenuItem value="">未分配</MenuItem>
                {schoolOptions.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
              <TextField label="头像" value={scholarForm.portraitUrl} sx={fieldSx} onChange={(event) => setScholarForm((state) => ({ ...state, portraitUrl: event.target.value }))} />
              <TextField label="主要成就" value={scholarForm.achievements} multiline minRows={4} sx={fieldSx} onChange={(event) => setScholarForm((state) => ({ ...state, achievements: event.target.value }))} />
              <TextField label="代表作品" value={scholarForm.majorWorks} multiline minRows={4} sx={fieldSx} onChange={(event) => setScholarForm((state) => ({ ...state, majorWorks: event.target.value }))} />
              <TextField label="资料来源" value={scholarForm.sources} multiline minRows={3} sx={fieldSx} onChange={(event) => setScholarForm((state) => ({ ...state, sources: event.target.value }))} />
              <TextField label="人物传记" value={scholarForm.biography} multiline minRows={5} sx={{ ...fieldSx, gridColumn: '1 / -1' }} onChange={(event) => setScholarForm((state) => ({ ...state, biography: event.target.value }))} />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          取消
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={!canSubmit || saving}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CultureEditDialog;
