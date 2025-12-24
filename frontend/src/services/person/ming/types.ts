/**
 * 明朝人物数据类型定义
 * Ming Dynasty Figure Data Types
 * 
 * 定义明朝政治人物的数据结构和验证模式
 * 
 * Requirements: 7.1, 7.2
 */

import { z } from 'zod';

/**
 * 明朝人物角色类型
 */
export type MingFigureRole = 'emperor' | 'cabinet' | 'general' | 'official' | 'eunuch' | 'other';

/**
 * 历史事件接口
 */
export interface HistoricalEvent {
  name: string;        // 事件名称
  year: number;        // 发生年份
  role: string;        // 人物在事件中的角色
  description: string; // 事件描述
}

/**
 * 历史评价接口（复用）
 */
export interface HistoricalEvaluation {
  source: string;      // 来源
  content: string;     // 评价内容
  author?: string;     // 作者
}

/**
 * 明朝人物接口
 */
export interface MingFigure {
  id: string;
  name: string;                        // 姓名
  courtesy?: string;                   // 字
  birthYear: number;                   // 出生年
  deathYear: number;                   // 去世年
  role: MingFigureRole;                // 角色类型
  positions: string[];                 // 担任职位
  faction?: string;                    // 政治派系
  biography: string;                   // 生平简介
  politicalViews?: string;             // 政治主张
  achievements: string[];              // 主要成就
  events: HistoricalEvent[];           // 参与的历史事件
  evaluations: HistoricalEvaluation[]; // 历史评价
  portraitUrl?: string;                // 画像URL
  sources: string[];                   // 参考资料
}

/**
 * 明朝人物角色Zod验证模式
 */
export const MingFigureRoleSchema = z.enum([
  'emperor',
  'cabinet',
  'general',
  'official',
  'eunuch',
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
 * 明朝人物Zod验证模式
 */
export const MingFigureSchema = z.object({
  id: z.string().min(1, 'ID不能为空'),
  name: z.string().min(1, '姓名不能为空'),
  courtesy: z.string().optional(),
  birthYear: z.number(),
  deathYear: z.number(),
  role: MingFigureRoleSchema,
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
 * 明朝人物数组验证模式
 */
export const MingFiguresSchema = z.array(MingFigureSchema);

/**
 * 角色类型中文映射
 */
export const ROLE_LABELS: Record<MingFigureRole, string> = {
  emperor: '皇帝',
  cabinet: '内阁大臣',
  general: '将领',
  official: '官员',
  eunuch: '宦官',
  other: '其他',
};

/**
 * 明朝时期划分
 */
export const MING_PERIODS = [
  { id: 'early', name: '明初（1368-1435）', startYear: 1368, endYear: 1435 },
  { id: 'middle', name: '明中期（1436-1572）', startYear: 1436, endYear: 1572 },
  { id: 'late', name: '明末（1573-1644）', startYear: 1573, endYear: 1644 },
];

/**
 * 获取人物所属时期
 */
export function getMingPeriod(birthYear: number): string {
  for (const period of MING_PERIODS) {
    if (birthYear >= period.startYear && birthYear <= period.endYear) {
      return period.name;
    }
  }
  return '其他';
}
