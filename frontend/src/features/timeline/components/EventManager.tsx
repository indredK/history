import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { useRequest } from 'ahooks';
import type { Event, EventInput } from '@/services/timeline/types';
import { createEvent, deleteEvent, updateEvent } from '@/services/timeline/timelineApi';
import { getTimelineEventCategories } from '../utils/timelineFilters';
import { formatTimelineYear } from '../utils/dynastyUtils';

type FormMode = 'create' | 'edit';

interface EventManagerProps {
  events: Event[];
  onEventsChange: (events: Event[]) => void;
}

interface EventFormState {
  title: string;
  startYear: string;
  endYear: string;
  eventType: string;
  description: string;
  participants: string;
  locations: string;
  sourceIds: string;
}

const emptyForm: EventFormState = {
  title: '',
  startYear: '',
  endYear: '',
  eventType: '',
  description: '',
  participants: '',
  locations: '',
  sourceIds: '',
};

function formatEventYear(event: Event): string {
  return event.endYear !== undefined && event.endYear !== null && event.endYear !== event.startYear
    ? `${formatTimelineYear(event.startYear)} - ${formatTimelineYear(event.endYear)}`
    : formatTimelineYear(event.startYear);
}

function parseYear(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseParticipants(value: string): NonNullable<EventInput['participants']> {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [id = '', role = ''] = line
        .split('|')
        .map((part) => part.trim());
      return {
        personId: id,
        role: role || null,
      };
    })
    .filter((item) => item.personId);
}

function parseLocations(value: string): NonNullable<EventInput['locations']> {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [id = '', role = ''] = line
        .split('|')
        .map((part) => part.trim());
      return {
        placeId: id,
        role: role || null,
      };
    })
    .filter((item) => item.placeId);
}

function parseSourceIds(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[,，、\n]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function hasRelationText(value: string): boolean {
  return value.trim().length > 0;
}

function relationLines(event: Event, kind: 'participants' | 'locations'): string {
  const items = kind === 'participants'
    ? event.participants?.map((item) => [item.personId, item.role || ''].filter(Boolean).join(' | '))
    : event.locations?.map((item) => [item.placeId, item.role || ''].filter(Boolean).join(' | '));

  return items?.join('\n') || '';
}

function buildFormState(event: Event | null): EventFormState {
  if (!event) return emptyForm;

  return {
    title: event.title,
    startYear: String(event.startYear),
    endYear: event.endYear === undefined || event.endYear === null ? '' : String(event.endYear),
    eventType: event.categories?.[0]?.join(',') || event.eventType || '',
    description: event.description || '',
    participants: relationLines(event, 'participants'),
    locations: relationLines(event, 'locations'),
    sourceIds: event.source_ids?.join('\n') || event.sources?.map((source) => source.id).join('\n') || '',
  };
}

function buildEventInput(form: EventFormState, originalEvent: Event | null = null): EventInput | null {
  const title = form.title.trim();
  const startYear = parseYear(form.startYear);
  const endYear = parseYear(form.endYear);
  const originalForm = originalEvent ? buildFormState(originalEvent) : emptyForm;

  if (!title || startYear === null) {
    return null;
  }

  const input: EventInput = {
    title,
    startYear,
    endYear,
    description: form.description.trim() || null,
    eventType: form.eventType.trim() || null,
  };

  if (hasRelationText(form.participants) || hasRelationText(originalForm.participants)) {
    input.participants = parseParticipants(form.participants);
  }

  if (hasRelationText(form.locations) || hasRelationText(originalForm.locations)) {
    input.locations = parseLocations(form.locations);
  }

  if (hasRelationText(form.sourceIds) || hasRelationText(originalForm.sourceIds)) {
    input.sourceIds = parseSourceIds(form.sourceIds);
  }

  return input;
}

function validateEventInput(input: EventInput): string | null {
  if (input.startYear === 0 || input.endYear === 0) {
    return '事件年份不能为 0，历史纪年没有公元 0 年';
  }

  if (input.endYear !== undefined && input.endYear !== null && input.endYear < input.startYear) {
    return '事件结束年份不能早于开始年份';
  }

  return null;
}

function sortEvents(events: Event[]): Event[] {
  return [...events].sort((left, right) => {
    const yearDiff = left.startYear - right.startYear;
    if (yearDiff !== 0) return yearDiff;
    return left.title.localeCompare(right.title, 'zh-Hans-CN');
  });
}

export function EventManager({ events, onEventsChange }: EventManagerProps) {
  const [query, setQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [form, setForm] = useState<EventFormState>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<Event | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedEvent && events.length > 0) {
      setSelectedEvent(events[0] ?? null);
      return;
    }

    if (selectedEvent && !events.some((event) => event.id === selectedEvent.id)) {
      setSelectedEvent(events[0] ?? null);
    }
  }, [events, selectedEvent]);

  const visibleEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return events.slice(0, 80);

    return events
      .filter((event) => {
        const haystack = [
          event.title,
          event.description,
          event.eventType,
          ...getTimelineEventCategories(event),
          ...(event.rawLocations ?? []),
          ...(event.rawParticipants ?? []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .slice(0, 80);
  }, [events, query]);

  const { run: saveEvent, loading: saving } = useRequest(
    async () => {
      const input = buildEventInput(form, formMode === 'edit' ? selectedEvent : null);
      if (!input) {
        throw new Error('请填写标题和开始年份');
      }

      const inputError = validateEventInput(input);
      if (inputError) {
        throw new Error(inputError);
      }

      if (formMode === 'edit' && selectedEvent) {
        const result = await updateEvent(selectedEvent.id, input);
        return result.data;
      }

      const result = await createEvent(input);
      return result.data;
    },
    {
      manual: true,
      onBefore: () => setMutationError(null),
      onSuccess: (saved) => {
        const nextEvents =
          formMode === 'edit'
            ? events.map((event) => (event.id === saved.id ? saved : event))
            : [saved, ...events];
        onEventsChange(sortEvents(nextEvents));
        setSelectedEvent(saved);
        setFormOpen(false);
      },
      onError: (error) => {
        setMutationError(error instanceof Error ? error.message : '保存失败');
      },
    },
  );

  const { run: removeEvent, loading: deleting } = useRequest(
    async (event: Event) => {
      const result = await deleteEvent(event.id);
      return result.data;
    },
    {
      manual: true,
      onBefore: () => setMutationError(null),
      onSuccess: (_deleted, [event]) => {
        const nextEvents = events.filter((item) => item.id !== event.id);
        onEventsChange(nextEvents);
        setPendingDelete(null);
        if (selectedEvent?.id === event.id) {
          setSelectedEvent(nextEvents[0] ?? null);
        }
      },
      onError: (error) => {
        setMutationError(error instanceof Error ? error.message : '删除失败');
      },
    },
  );

  const openCreateDialog = () => {
    setFormMode('create');
    setForm(emptyForm);
    setMutationError(null);
    setFormOpen(true);
  };

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    setFormMode('edit');
    setForm(buildFormState(event));
    setMutationError(null);
    setFormOpen(true);
  };

  const editingEvent = formMode === 'edit' ? selectedEvent : null;
  const formInput = buildEventInput(form, editingEvent);

  return (
    <section className="timeline-event-manager">
      <div className="timeline-event-manager__toolbar">
        <label className="timeline-event-manager__search">
          <SearchIcon fontSize="small" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索事件、地点、人物"
          />
        </label>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          新增事件
        </Button>
      </div>

      <div className="timeline-event-manager__body">
        <div className="timeline-event-manager__list">
          {visibleEvents.map((event) => {
            const selected = selectedEvent?.id === event.id;
            return (
              <button
                key={event.id}
                type="button"
                className={`timeline-event-manager__row${selected ? ' is-selected' : ''}`}
                onClick={() => setSelectedEvent(event)}
              >
                <span className="timeline-event-manager__year">{formatEventYear(event)}</span>
                <span className="timeline-event-manager__title">{event.title}</span>
                <span className="timeline-event-manager__category">
                  {getTimelineEventCategories(event).join(' / ')}
                </span>
              </button>
            );
          })}
        </div>

        <div className="timeline-event-manager__detail">
          {selectedEvent ? (
            <>
              <div className="timeline-event-manager__detail-head">
                <div>
                  <Typography variant="overline">{formatEventYear(selectedEvent)}</Typography>
                  <Typography variant="h6">{selectedEvent.title}</Typography>
                </div>
                <div className="timeline-event-manager__actions">
                  <Tooltip title="编辑事件">
                    <IconButton size="small" onClick={() => openEditDialog(selectedEvent)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="删除事件">
                    <IconButton size="small" color="error" onClick={() => setPendingDelete(selectedEvent)}>
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
              <Typography variant="body2" className="timeline-event-manager__description">
                {selectedEvent.description || '暂无描述'}
              </Typography>
              <div className="timeline-event-manager__meta">
                <span>{getTimelineEventCategories(selectedEvent).join(' / ')}</span>
                <span>{selectedEvent.participants?.length ?? selectedEvent.rawParticipants?.length ?? 0} 位人物</span>
                <span>{selectedEvent.locations?.length ?? selectedEvent.rawLocations?.length ?? 0} 个地点</span>
                <span>{selectedEvent.sources?.length ?? selectedEvent.source_ids?.length ?? 0} 条来源</span>
              </div>
            </>
          ) : (
            <Typography variant="body2">暂无事件</Typography>
          )}
        </div>
      </div>

      <Dialog open={formOpen} onClose={saving ? undefined : () => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{formMode === 'create' ? '新增事件' : '编辑事件'}</DialogTitle>
        <DialogContent dividers>
          <Box className="timeline-event-manager__form">
            <TextField
              label="标题"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="开始年份"
              type="number"
              value={form.startYear}
              onChange={(event) => setForm((prev) => ({ ...prev, startYear: event.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="结束年份"
              type="number"
              value={form.endYear}
              onChange={(event) => setForm((prev) => ({ ...prev, endYear: event.target.value }))}
              fullWidth
            />
            <TextField
              label="事件标签"
              value={form.eventType}
              onChange={(event) => setForm((prev) => ({ ...prev, eventType: event.target.value }))}
              fullWidth
            />
            <TextField
              label="描述"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              fullWidth
              multiline
              minRows={4}
              sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
            />
            <TextField
              label="参与人物"
              value={form.participants}
              onChange={(event) => setForm((prev) => ({ ...prev, participants: event.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />
            <TextField
              label="事件地点"
              value={form.locations}
              onChange={(event) => setForm((prev) => ({ ...prev, locations: event.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />
            <TextField
              label="来源 ID"
              value={form.sourceIds}
              onChange={(event) => setForm((prev) => ({ ...prev, sourceIds: event.target.value }))}
              fullWidth
              multiline
              minRows={3}
              sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
            />
          </Box>
          {mutationError && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {mutationError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button disabled={saving} onClick={() => setFormOpen(false)}>取消</Button>
          <Button variant="contained" disabled={saving || !formInput} onClick={() => saveEvent()}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(pendingDelete)} onClose={deleting ? undefined : () => setPendingDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>删除事件</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            确认删除「{pendingDelete?.title}」？
          </Typography>
          {mutationError && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {mutationError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button disabled={deleting} onClick={() => setPendingDelete(null)}>取消</Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleting || !pendingDelete}
            onClick={() => pendingDelete && removeEvent(pendingDelete)}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}
