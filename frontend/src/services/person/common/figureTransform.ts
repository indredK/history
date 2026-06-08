export type RawFigureRecord = Record<string, unknown>;

export interface FigureEventLike {
  name: string;
  year: number;
  role: string;
  description: string;
}

export interface FigureEvaluationLike {
  source: string;
  content: string;
  author?: string;
}

export function isRecord(value: unknown): value is RawFigureRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readValue(record: RawFigureRecord, keys: string[]): unknown {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
}

export function readString(
  record: RawFigureRecord,
  keys: string | string[],
  fallback = '',
): string {
  const value = readValue(record, Array.isArray(keys) ? keys : [keys]);
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

export function readOptionalString(
  record: RawFigureRecord,
  keys: string | string[],
): string | undefined {
  const value = readString(record, keys).trim();
  return value || undefined;
}

export function readNumber(
  record: RawFigureRecord,
  keys: string | string[],
  fallback = 0,
): number {
  const value = readValue(record, Array.isArray(keys) ? keys : [keys]);
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function readStringArray(
  record: RawFigureRecord,
  keys: string | string[],
  separator: RegExp = /[,|]/,
): string[] {
  const value = readValue(record, Array.isArray(keys) ? keys : [keys]);
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item : String(item ?? '')))
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(separator)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function readEvents(record: RawFigureRecord): FigureEventLike[] {
  const value = record.events;
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => {
    const event = isRecord(item) ? item : {};
    return {
      name: readString(event, 'name', `事件${index + 1}`),
      year: readNumber(event, 'year', 0),
      role: readString(event, 'role'),
      description: readString(event, 'description'),
    };
  });
}

export function readEvaluations(record: RawFigureRecord): FigureEvaluationLike[] {
  const value = record.evaluations;
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => {
    const evaluation = isRecord(item) ? item : {};
    const result: FigureEvaluationLike = {
      source: readString(evaluation, 'source', `来源${index + 1}`),
      content: readString(evaluation, 'content'),
    };
    const author = readOptionalString(evaluation, 'author');
    if (author) result.author = author;
    return result;
  });
}
