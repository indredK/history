/**
 * 帝王数据类型定义
 * Emperor Data Types
 * 
 * 定义中国历代帝王的数据结构和验证模式
 * 
 * Requirements: 7.1, 7.2
 */

import { z } from 'zod';

/**
 * 年号接口
 */
export interface EraName {
  name: string;        // 年号名称
  startYear: number;   // 起始年（负数表示公元前）
  endYear: number;     // 结束年
}

/**
 * 历史评价接口
 */
export interface HistoricalEvaluation {
  source: string;      // 来源（如《史记》、《资治通鉴》）
  content: string;     // 评价内容
  author?: string;     // 作者
}

/**
 * 帝王接口
 */
export interface Emperor {
  id: string;
  name: string;                        // 姓名
  templeName?: string;                 // 庙号
  posthumousName?: string;             // 谥号
  dynasty: string;                     // 朝代
  dynastyPeriod?: string;              // 朝代时期（如西汉、东汉）
  reignStart: number;                  // 在位起始年（负数表示公元前）
  reignEnd: number;                    // 在位结束年
  eraNames: EraName[];                 // 年号列表
  achievements: string[];              // 主要功绩
  failures: string[];                  // 重大失误
  evaluations: HistoricalEvaluation[]; // 历史评价
  biography?: string;                  // 简介
  portraitUrl?: string;                // 画像URL
  sources: string[];                   // 参考资料
}

/**
 * 年号Zod验证模式
 */
export const EraNameSchema = z.object({
  name: z.string().min(1, '年号名称不能为空'),
  startYear: z.number(),
  endYear: z.number(),
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
 * 帝王Zod验证模式
 */
export const EmperorSchema = z.object({
  id: z.string().min(1, 'ID不能为空'),
  name: z.string().min(1, '姓名不能为空'),
  templeName: z.string().optional(),
  posthumousName: z.string().optional(),
  dynasty: z.string().min(1, '朝代不能为空'),
  dynastyPeriod: z.string().optional(),
  reignStart: z.number(),
  reignEnd: z.number(),
  eraNames: z.array(EraNameSchema),
  achievements: z.array(z.string()),
  failures: z.array(z.string()),
  evaluations: z.array(HistoricalEvaluationSchema),
  biography: z.string().optional(),
  portraitUrl: z.string().optional(),
  sources: z.array(z.string()),
});

/**
 * 帝王数组验证模式
 */
export const EmperorsSchema = z.array(EmperorSchema);

/**
 * 朝代顺序映射（用于排序）
 */
export const DYNASTY_ORDER: Record<string, number> = {
  '上古': 1,
  '夏': 2,
  '商': 3,
  '西周': 4,
  '东周': 5,
  '秦': 6,
  '西汉': 7,
  '新': 8,
  '东汉': 9,
  '三国': 10,
  '西晋': 11,
  '东晋': 12,
  '南北朝': 13,
  '隋': 14,
  '唐': 15,
  '五代十国': 16,
  '北宋': 17,
  '南宋': 18,
  '辽': 19,
  '金': 20,
  '元': 21,
  '明': 22,
  '清': 23,
};

/**
 * 获取朝代排序值
 */
export function getDynastyOrder(dynasty: string): number {
  return DYNASTY_ORDER[dynasty] ?? 999;
}
