import { z } from 'zod';

export interface SourceRef {
  id: string;
  title?: string;
  url?: string;
}

export interface Event {
  id: string;
  title: string;
  title_en?: string;
  startYear: number;
  startMonth?: number;
  endYear?: number;
  endMonth?: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  eventType?: string;
  imageUrls?: string[];
  categories?: string[][];
  sources?: SourceRef[];
  source_ids?: string[];
  confidence?: number;
  created_at?: string;
  updated_at?: string;
}

export const EventSchema = z.object({
  id: z.string(),
  title: z.string(),
  title_en: z.string().optional(),
  startYear: z.number(),
  startMonth: z.number().optional(),
  endYear: z.number().optional(),
  endMonth: z.number().optional(),
  description: z.string().optional(),
  eventType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  categories: z.array(z.array(z.string())).optional(),
  sources: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        url: z.string().optional(),
      })
    )
    .optional(),
  source_ids: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
