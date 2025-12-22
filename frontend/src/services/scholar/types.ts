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
  name_en: string;
  dynasty: string;
  birthYear: number;
  deathYear: number;
  schoolOfThought: string;
  biography: string;
  portraitUrl?: string;
  achievements: string[];
  representativeWorks: LiteraryWork[];
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
  name_en: z.string(),
  dynasty: z.string(),
  birthYear: z.number(),
  deathYear: z.number(),
  schoolOfThought: z.string(),
  biography: z.string(),
  portraitUrl: z.string().optional(),
  achievements: z.array(z.string()),
  representativeWorks: z.array(LiteraryWorkSchema),
});
