import { z } from 'zod';

/**
 * Literary work type enum
 */
export type LiteraryWorkType = 'prose' | 'poetry' | 'essay' | 'memorial';

/**
 * Literary work interface representing a scholar's written work
 */
export interface LiteraryWork {
  id: string;
  title: string;
  type: LiteraryWorkType;
  description: string;
  contentExcerpt?: string;
}

/**
 * Scholar interface representing a cultural figure
 */
export interface Scholar {
  id: string;
  name: string;
  name_en?: string;
  dynasty?: string;
  dynastyPeriod?: string; // 后端字段名
  birthYear?: number | null;
  deathYear?: number | null;
  schoolOfThought?: string;
  philosophicalSchoolId?: string; // 后端字段名
  biography?: string | null;
  portraitUrl?: string;
  achievements?: string[];
  contributions?: string[] | null; // 后端字段名
  representativeWorks?: LiteraryWork[];
  majorWorks?: string[] | null; // 后端字段名
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

/**
 * Zod schema for LiteraryWork validation
 */
export const LiteraryWorkSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['prose', 'poetry', 'essay', 'memorial']),
  description: z.string(),
  contentExcerpt: z.string().optional(),
});

/**
 * Zod schema for Scholar validation
 */
export const ScholarSchema = z.object({
  id: z.string(),
  name: z.string(),
  name_en: z.string().optional(),
  dynasty: z.string().optional(),
  dynastyPeriod: z.string().optional(),
  birthYear: z.number().nullable().optional(),
  deathYear: z.number().nullable().optional(),
  schoolOfThought: z.string().optional(),
  philosophicalSchoolId: z.string().optional(),
  biography: z.string().nullable().optional(),
  portraitUrl: z.string().optional(),
  achievements: z.array(z.string()).optional(),
  contributions: z.array(z.string()).nullable().optional(),
  representativeWorks: z.array(LiteraryWorkSchema).optional(),
  majorWorks: z.array(z.string()).nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});