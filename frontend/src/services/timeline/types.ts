import { z } from 'zod';

export interface SourceRef {
  id: string;
  title?: string;
  url?: string;
  author?: string;
}

export interface EventParticipantRef {
  id?: string;
  personId: string;
  role?: string | null;
  person?: {
    id: string;
    name: string;
    dynasty?: string | null;
  } | null;
}

export interface EventLocationRef {
  id?: string;
  placeId: string;
  role?: string | null;
  place?: {
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
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
  participants?: EventParticipantRef[];
  locations?: EventLocationRef[];
  rawLocations?: string[];
  rawParticipants?: string[];
  mapFocusStartYear?: number;
  mapFocusEndYear?: number;
  mapLocationHints?: string[];
  dynastyId?: string;
  demoPriority?: number;
  confidence?: number;
  created_at?: string;
  updated_at?: string;
}

export interface EventInput {
  title: string;
  startYear: number;
  endYear?: number | null;
  description?: string | null;
  eventType?: string | null;
  participants?: Array<{
    personId: string;
    role?: string | null;
  }>;
  locations?: Array<{
    placeId: string;
    role?: string | null;
  }>;
  sourceIds?: string[];
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
        author: z.string().optional(),
      })
    )
    .optional(),
  source_ids: z.array(z.string()).optional(),
  participants: z
    .array(
      z.object({
        id: z.string().optional(),
        personId: z.string(),
        role: z.string().nullable().optional(),
        person: z
          .object({
            id: z.string(),
            name: z.string(),
            dynasty: z.string().nullable().optional(),
          })
          .nullable()
          .optional(),
      })
    )
    .optional(),
  locations: z
    .array(
      z.object({
        id: z.string().optional(),
        placeId: z.string(),
        role: z.string().nullable().optional(),
        place: z
          .object({
            id: z.string(),
            name: z.string(),
            latitude: z.number().nullable().optional(),
            longitude: z.number().nullable().optional(),
          })
          .nullable()
          .optional(),
      })
    )
    .optional(),
  rawLocations: z.array(z.string()).optional(),
  rawParticipants: z.array(z.string()).optional(),
  mapFocusStartYear: z.number().optional(),
  mapFocusEndYear: z.number().optional(),
  mapLocationHints: z.array(z.string()).optional(),
  dynastyId: z.string().optional(),
  demoPriority: z.number().optional(),
  confidence: z.number().min(0).max(1).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
