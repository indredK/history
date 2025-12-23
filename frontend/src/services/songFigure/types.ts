/**
 * 宋朝人物数据类型定义
 * Song Dynasty Figure Data Types
 */

import { z } from 'zod';

export type SongFigureRole = 'emperor' | 'chancellor' | 'general' | 'official' | 'scholar' | 'other';

export interface HistoricalEvent {
  name: string;
  year: number;
  role: string;
  description: string;
}

export interface HistoricalEvaluation {
  source: string;
  content: string;
  author?: string;
}

export interface SongFigure {
  id: string;
  name: string;
  courtesy?: string;
  birthYear: number;
  deathYear: number;
  role: SongFigureRole;
  positions: string[];
  faction?: string;
  biography: string;
  politicalViews?: string;
  achievements: string[];
  events: HistoricalEvent[];
  evaluations: HistoricalEvaluation[];
  portraitUrl?: string;
  sources: string[];
}

export const SongFigureRoleSchema = z.enum([
  'emperor', 'chancellor', 'general', 'official', 'scholar', 'other'
]);

export const HistoricalEventSchema = z.object({
  name: z.string().min(1),
  year: z.number(),
  role: z.string().min(1),
  description: z.string().min(1),
});

export const HistoricalEvaluationSchema = z.object({
  source: z.string().min(1),
  content: z.string().min(1),
  author: z.string().optional(),
});

export const SongFigureSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  courtesy: z.string().optional(),
  birthYear: z.number(),
  deathYear: z.number(),
  role: SongFigureRoleSchema,
  positions: z.array(z.string()),
  faction: z.string().optional(),
  biography: z.string().min(1),
  politicalViews: z.string().optional(),
  achievements: z.array(z.string()),
  events: z.array(HistoricalEventSchema),
  evaluations: z.array(HistoricalEvaluationSchema),
  portraitUrl: z.string().optional(),
  sources: z.array(z.string()),
});

export const ROLE_LABELS: Record<SongFigureRole, string> = {
  emperor: '皇帝',
  chancellor: '宰相',
  general: '将领',
  official: '官员',
  scholar: '学者',
  other: '其他',
};

export const SONG_PERIODS = [
  { id: 'northern-early', name: '北宋前期（960-1067）', startYear: 960, endYear: 1067 },
  { id: 'northern-late', name: '北宋后期（1068-1127）', startYear: 1068, endYear: 1127 },
  { id: 'southern-early', name: '南宋前期（1127-1200）', startYear: 1127, endYear: 1200 },
  { id: 'southern-late', name: '南宋后期（1201-1279）', startYear: 1201, endYear: 1279 },
];

export function getSongPeriod(birthYear: number): string {
  for (const period of SONG_PERIODS) {
    if (birthYear >= period.startYear && birthYear <= period.endYear) {
      return period.name;
    }
  }
  return '其他';
}
