/**
 * 三国人物数据类型定义
 * Three Kingdoms Figure Data Types
 */

import { z } from 'zod';

export type SanguoFigureRole = 'ruler' | 'strategist' | 'general' | 'official' | 'other';
export type SanguoKingdom = '魏' | '蜀' | '吴' | '其他';

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

export interface SanguoFigure {
  id: string;
  name: string;
  courtesy?: string;
  birthYear: number;
  deathYear: number;
  role: SanguoFigureRole;
  kingdom: SanguoKingdom;
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

export const SanguoFigureRoleSchema = z.enum([
  'ruler', 'strategist', 'general', 'official', 'other'
]);

export const SanguoKingdomSchema = z.enum(['魏', '蜀', '吴', '其他']);

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

export const SanguoFigureSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  courtesy: z.string().optional(),
  birthYear: z.number(),
  deathYear: z.number(),
  role: SanguoFigureRoleSchema,
  kingdom: SanguoKingdomSchema,
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

export const ROLE_LABELS: Record<SanguoFigureRole, string> = {
  ruler: '君主',
  strategist: '谋士',
  general: '将领',
  official: '官员',
  other: '其他',
};

export const KINGDOM_LABELS: Record<SanguoKingdom, string> = {
  '魏': '曹魏',
  '蜀': '蜀汉',
  '吴': '东吴',
  '其他': '其他',
};

export const KINGDOM_COLORS: Record<SanguoKingdom, { bg: string; text: string }> = {
  '魏': { bg: 'rgba(33, 150, 243, 0.15)', text: '#2196f3' },
  '蜀': { bg: 'rgba(76, 175, 80, 0.15)', text: '#4caf50' },
  '吴': { bg: 'rgba(244, 67, 54, 0.15)', text: '#F44336' },
  '其他': { bg: 'rgba(158, 158, 158, 0.15)', text: '#9e9e9e' },
};
