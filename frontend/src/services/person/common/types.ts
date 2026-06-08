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
  nameEn: z.string().optional(),
  name_en: z.string().optional(),
  courtesy: z.string().optional(),
  dynasty: z.string().optional(),
  period: z.string().optional(),
  gender: z.string().optional(),
  birthYear: z.number().optional(),
  birthMonth: z.number().optional(),
  deathYear: z.number().optional(),
  deathMonth: z.number().optional(),
  birthplace: z.string().optional(),
  biography: z.string().optional(),
  roles: z.array(z.string()).optional(),
  aliases: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  works: z.array(z.string()).optional(),
  events: z.array(z.object({
    name: z.string(),
    year: z.number().optional(),
    role: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
  evaluations: z.array(z.object({
    source: z.string(),
    content: z.string(),
    author: z.string().optional(),
  })).optional(),
  portraitUrl: z.string().optional(),
  sources: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    url: z.string().optional(),
    author: z.string().optional(),
  })).optional(),
  source_ids: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
