import { z } from 'zod';

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

export const PlaceSchema = z.object({
  id: z.string(),
  canonical_name: z.string(),
  alt_names: z.array(z.string()).optional(),
  description: z.string().optional(),
  location: z
    .object({
      type: z.literal('Point'),
      coordinates: z.tuple([z.number(), z.number()]),
    })
    .optional(),
  source_ids: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
