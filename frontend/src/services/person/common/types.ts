import { z } from 'zod';

export interface SourceRef {
  id?: string;
  title: string;
  url?: string | null;
  author?: string | null;
}

export interface PersonEvent {
  name: string;
  year?: number | null;
  role?: string | null;
  description?: string | null;
}

export interface PersonEvaluation {
  source: string;
  content: string;
  author?: string | null;
}

export interface CommonPerson {
  id: string;
  name: string;
  nameEn?: string | null;
  name_en?: string | null;
  courtesy?: string | null;
  dynasty?: string | null;
  period?: string | null;
  gender?: string | null;
  birthYear?: number | null;
  birthMonth?: number | null;
  deathYear?: number | null;
  deathMonth?: number | null;
  birthplace?: string | null;
  biography?: string | null;
  roles?: string[];
  aliases?: string[];
  achievements?: string[];
  works?: string[];
  events?: PersonEvent[];
  evaluations?: PersonEvaluation[];
  portraitUrl?: string | null;
  sources?: SourceRef[];
  source_ids?: string[];
  confidence?: number | null;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export type CreateCommonPersonInput = Omit<
  CommonPerson,
  'id' | 'createdAt' | 'updatedAt' | 'created_at' | 'updated_at'
>;

export type UpdateCommonPersonInput = Partial<CreateCommonPersonInput>;

export const CommonPersonSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameEn: z.string().nullable().optional(),
  name_en: z.string().nullable().optional(),
  courtesy: z.string().nullable().optional(),
  dynasty: z.string().nullable().optional(),
  period: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  birthYear: z.number().nullable().optional(),
  birthMonth: z.number().nullable().optional(),
  deathYear: z.number().nullable().optional(),
  deathMonth: z.number().nullable().optional(),
  birthplace: z.string().nullable().optional(),
  biography: z.string().nullable().optional(),
  roles: z.array(z.string()).optional(),
  aliases: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  works: z.array(z.string()).optional(),
  events: z.array(z.object({
    name: z.string(),
    year: z.number().nullable().optional(),
    role: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
  })).optional(),
  evaluations: z.array(z.object({
    source: z.string(),
    content: z.string(),
    author: z.string().nullable().optional(),
  })).optional(),
  portraitUrl: z.string().nullable().optional(),
  sources: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    url: z.string().nullable().optional(),
    author: z.string().nullable().optional(),
  })).optional(),
  source_ids: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
