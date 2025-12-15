import { z } from 'zod';

export interface SourceRef {
  id: string;
  title?: string;
  url?: string;
}

export interface Person {
  id: string;
  name: string;
  name_en?: string;
  birthYear?: number;
  birthMonth?: number;
  deathYear?: number;
  deathMonth?: number;
  biography?: string;
  roles?: string[];
  source_ids?: string[];
  confidence?: number;
  created_at?: string;
  updated_at?: string;
}

export const PersonSchema = z.object({
  id: z.string(),
  name: z.string(),
  name_en: z.string().optional(),
  birthYear: z.number().optional(),
  birthMonth: z.number().optional(),
  deathYear: z.number().optional(),
  deathMonth: z.number().optional(),
  biography: z.string().optional(),
  roles: z.array(z.string()).optional(),
  source_ids: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
