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
  name_en?: string | null;
  dynasty?: string | null;
  dynastyPeriod?: string | null; // 后端字段名
  birthYear?: number | null;
  deathYear?: number | null;
  schoolOfThought?: string | null;
  philosophicalSchoolId?: string | null; // 后端字段名
  biography?: string | null;
  portraitUrl?: string | null;
  achievements?: string[] | null;
  contributions?: string[] | null; // 后端字段名
  representativeWorks?: Array<LiteraryWork | string>;
  majorWorks?: Array<LiteraryWork | string> | null; // 后端字段名
  sources?: string[] | null;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type ScholarMutationInput = Omit<
  Scholar,
  'id' | 'createdAt' | 'updatedAt' | 'representativeWorks'
> & {
  id?: string;
};

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
  achievements: z.array(z.string()).nullable().optional(),
  contributions: z.array(z.string()).nullable().optional(),
  representativeWorks: z.array(z.union([LiteraryWorkSchema, z.string()])).optional(),
  majorWorks: z.array(z.union([LiteraryWorkSchema, z.string()])).nullable().optional(),
  sources: z.array(z.string()).nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
