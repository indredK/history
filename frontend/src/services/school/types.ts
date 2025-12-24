import { z } from 'zod';

/**
 * Representative figure interface
 * 代表人物接口
 */
export interface RepresentativeFigure {
  id: string;
  name: string;
  name_en: string;
  period: string;
  contribution: string;
}

/**
 * Classic work interface
 * 经典著作接口
 */
export interface ClassicWork {
  id: string;
  title: string;
  title_en: string;
  author: string;
  description: string;
}

/**
 * Philosophical school interface
 * 思想流派接口
 */
export interface PhilosophicalSchool {
  id: string;
  name: string;
  name_en?: string;
  founder?: string | null;
  founderEn?: string;
  foundingYear?: number | null;
  foundingPeriod?: string;
  coreBeliefs?: string[] | null;
  coreIdeas?: string[]; // 兼容旧字段名
  keyTexts?: string[] | null;
  representativeFigures?: RepresentativeFigure[];
  classicWorks?: ClassicWork[];
  description?: string | null;
  influence?: string;
  color?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Zod schema for RepresentativeFigure validation
 */
export const RepresentativeFigureSchema = z.object({
  id: z.string(),
  name: z.string(),
  name_en: z.string(),
  period: z.string(),
  contribution: z.string(),
});

/**
 * Zod schema for ClassicWork validation
 */
export const ClassicWorkSchema = z.object({
  id: z.string(),
  title: z.string(),
  title_en: z.string(),
  author: z.string(),
  description: z.string(),
});

/**
 * Zod schema for PhilosophicalSchool validation
 */
export const PhilosophicalSchoolSchema = z.object({
  id: z.string(),
  name: z.string(),
  name_en: z.string().optional(),
  founder: z.string().nullable().optional(),
  founderEn: z.string().optional(),
  foundingYear: z.number().nullable().optional(),
  foundingPeriod: z.string().optional(),
  coreBeliefs: z.array(z.string()).nullable().optional(),
  coreIdeas: z.array(z.string()).optional(), // 兼容旧字段名
  keyTexts: z.array(z.string()).nullable().optional(),
  representativeFigures: z.array(RepresentativeFigureSchema).optional(),
  classicWorks: z.array(ClassicWorkSchema).optional(),
  description: z.string().nullable().optional(),
  influence: z.string().optional(),
  color: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
