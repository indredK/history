/**
 * 唐朝人物数据类型定义
 * Tang Dynasty Figure Data Types
 */

import { z } from 'zod';

/**
 * 唐朝人物角色类型
 */
export type TangFigureRole = 'emperor' | 'chancellor' | 'general' | 'official' | 'poet' | 'other';

/**
 * 历史事件接口
 */
export interface HistoricalEvent {
  name: string;
  year: number;
  role: string;
  description: string;
}

/**
 * 历史评价接口
 */
export interface HistoricalEvaluation {
  source: string;
  content: string;
  author?: string;
}

/**
 * 唐朝人物接口
 */
export interface TangFigure {
  id: string;
  name: string;
  courtesy?: string;
  birthYear: number;
  deathYear: number;
  role: TangFigureRole;
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

/**
 * 唐朝人物角色Zod验证模式
 */
export const TangFigureRoleSchema = z.enum([
  'emperor',
  'chancellor',
  'general',
  'official',
  'poet',
  'other'
]);

/**
 * 历史事件Zod验证模式
 */
export const HistoricalEventSchema = z.object({
  name: z.string().min(1, '事件名称不能为空'),
  year: z.number(),
  role: z.string().min(1, '角色不能为空'),
  description: z.string().min(1, '描述不能为空'),
});

/**
 * 历史评价Zod验证模式
 */
export const HistoricalEvaluationSchema = z.object({
  source: z.string().min(1, '来源不能为空'),
  content: z.string().min(1, '评价内容不能为空'),
  author: z.string().optional(),
});

/**
 * 唐朝人物Zod验证模式
 */
export const TangFigureSchema = z.object({
  id: z.string().min(1, 'ID不能为空'),
  name: z.string().min(1, '姓名不能为空'),
  courtesy: z.string().optional(),
  birthYear: z.number(),
  deathYear: z.number(),
  role: TangFigureRoleSchema,
  positions: z.array(z.string()),
  faction: z.string().optional(),
  biography: z.string().min(1, '简介不能为空'),
  politicalViews: z.string().optional(),
  achievements: z.array(z.string()),
  events: z.array(HistoricalEventSchema),
  evaluations: z.array(HistoricalEvaluationSchema),
  portraitUrl: z.string().optional(),
  sources: z.array(z.string()),
});

/**
 * 角色类型中文映射
 */
export const ROLE_LABELS: Record<TangFigureRole, string> = {
  emperor: '皇帝',
  chancellor: '宰相',
  general: '将领',
  official: '官员',
  poet: '诗人',
  other: '其他',
};

/**
 * 唐朝时期划分
 */
export const TANG_PERIODS = [
  { id: 'early', name: '初唐（618-712）', startYear: 618, endYear: 712 },
  { id: 'flourishing', name: '盛唐（713-765）', startYear: 713, endYear: 765 },
  { id: 'middle', name: '中唐（766-835）', startYear: 766, endYear: 835 },
  { id: 'late', name: '晚唐（836-907）', startYear: 836, endYear: 907 },
];

/**
 * 获取人物所属时期
 */
export function getTangPeriod(birthYear: number): string {
  for (const period of TANG_PERIODS) {
    if (birthYear >= period.startYear && birthYear <= period.endYear) {
      return period.name;
    }
  }
  return '其他';
}
