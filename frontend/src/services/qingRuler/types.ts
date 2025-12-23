/**
 * 清朝统治者数据类型定义
 * Qing Dynasty Ruler Data Types
 * 
 * 定义清朝统治者的数据结构和验证模式
 * 
 * Requirements: 7.1, 7.2
 */

import { z } from 'zod';

/**
 * 政策措施接口
 */
export interface PolicyMeasure {
  name: string;        // 政策名称
  year?: number;       // 实施年份
  description: string; // 政策描述
  impact: string;      // 影响
}

/**
 * 历史事件接口
 */
export interface HistoricalEvent {
  name: string;        // 事件名称
  year: number;        // 发生年份
  role: string;        // 统治者在事件中的角色
  description: string; // 事件描述
}

/**
 * 历史评价接口
 */
export interface HistoricalEvaluation {
  source: string;      // 来源
  content: string;     // 评价内容
  author?: string;     // 作者
}

/**
 * 清朝统治者接口
 */
export interface QingRuler {
  id: string;
  name: string;                        // 姓名
  templeName: string;                  // 庙号
  eraName: string;                     // 年号（清朝一帝一号）
  reignStart: number;                  // 在位起始年
  reignEnd: number;                    // 在位结束年
  policies: PolicyMeasure[];           // 政治举措
  majorEvents: HistoricalEvent[];      // 重大历史事件
  contribution: string;                // 对清朝兴衰的贡献
  responsibility: string;              // 对清朝兴衰的责任
  evaluations: HistoricalEvaluation[]; // 历史评价
  biography?: string;                  // 简介
  portraitUrl?: string;                // 画像URL
  sources: string[];                   // 参考资料
}

/**
 * 政策措施Zod验证模式
 */
export const PolicyMeasureSchema = z.object({
  name: z.string().min(1, '政策名称不能为空'),
  year: z.number().optional(),
  description: z.string().min(1, '描述不能为空'),
  impact: z.string().min(1, '影响不能为空'),
});

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
 * 清朝统治者Zod验证模式
 */
export const QingRulerSchema = z.object({
  id: z.string().min(1, 'ID不能为空'),
  name: z.string().min(1, '姓名不能为空'),
  templeName: z.string().min(1, '庙号不能为空'),
  eraName: z.string().min(1, '年号不能为空'),
  reignStart: z.number(),
  reignEnd: z.number(),
  policies: z.array(PolicyMeasureSchema),
  majorEvents: z.array(HistoricalEventSchema),
  contribution: z.string().min(1, '贡献不能为空'),
  responsibility: z.string().min(1, '责任不能为空'),
  evaluations: z.array(HistoricalEvaluationSchema),
  biography: z.string().optional(),
  portraitUrl: z.string().optional(),
  sources: z.array(z.string()),
});

/**
 * 清朝统治者数组验证模式
 */
export const QingRulersSchema = z.array(QingRulerSchema);

/**
 * 清朝时期划分
 */
export const QING_PERIODS = [
  { id: 'founding', name: '清初（1616-1722）', startYear: 1616, endYear: 1722 },
  { id: 'prosperity', name: '盛清（1723-1795）', startYear: 1723, endYear: 1795 },
  { id: 'decline', name: '清中期（1796-1861）', startYear: 1796, endYear: 1861 },
  { id: 'late', name: '晚清（1862-1912）', startYear: 1862, endYear: 1912 },
];

/**
 * 获取统治者所属时期
 */
export function getQingPeriod(reignStart: number): string {
  for (const period of QING_PERIODS) {
    if (reignStart >= period.startYear && reignStart <= period.endYear) {
      return period.name;
    }
  }
  return '其他';
}
