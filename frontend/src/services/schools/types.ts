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
  name_en: string;
  founder: string;
  founderEn: string;
  foundingPeriod: string;
  coreIdeas: string[];
  representativeFigures: RepresentativeFigure[];
  classicWorks: ClassicWork[];
  description: string;
  influence: string;
  color: string;
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
  name_en: z.string(),
  founder: z.string(),
  founderEn: z.string(),
  foundingPeriod: z.string(),
  coreIdeas: z.array(z.string()).min(1),
  representativeFigures: z.array(RepresentativeFigureSchema).min(1),
  classicWorks: z.array(ClassicWorkSchema).min(1),
  description: z.string().min(1),
  influence: z.string().min(1),
  color: z.string(),
});
