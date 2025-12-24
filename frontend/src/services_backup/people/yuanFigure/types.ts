/**
 * 元朝人物数据类型定义
 * Yuan Dynasty Figure Data Types
 */

import { z } from 'zod';

export type YuanFigureRole = 'emperor' | 'chancellor' | 'general' | 'official' | 'scholar' | 'other';

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

export interface YuanFigure {
  id: string;
  name: string;
  courtesy?: string;
  birthYear: number;
  deathYear: number;
  role: YuanFigureRole;
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

export const YuanFigureRoleSchema = z.enum([
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

export const YuanFigureSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  courtesy: z.string().optional(),
  birthYear: z.number(),
  deathYear: z.number(),
  role: YuanFigureRoleSchema,
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

export const ROLE_LABELS: Record<YuanFigureRole, string> = {
  emperor: '皇帝/大汗',
  chancellor: '丞相',
  general: '将领',
  official: '官员',
  scholar: '学者',
  other: '其他',
};

export const YUAN_PERIODS = [
  { id: 'early', name: '元初（1271-1294）', startYear: 1271, endYear: 1294 },
  { id: 'middle', name: '元中期（1295-1332）', startYear: 1295, endYear: 1332 },
  { id: 'late', name: '元末（1333-1368）', startYear: 1333, endYear: 1368 },
];

export function getYuanPeriod(birthYear: number): string {
  for (const period of YUAN_PERIODS) {
    if (birthYear >= period.startYear && birthYear <= period.endYear) {
      return period.name;
    }
  }
  return '其他';
}
