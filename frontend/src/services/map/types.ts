import { z } from 'zod';
import type { Feature, FeatureCollection, Polygon, MultiPolygon } from 'geojson';

export interface SourceRef {
  id: string;
  title?: string;
  url?: string;
}

export interface Place {
  id: string;
  canonical_name: string;
  alt_names?: string[];
  description?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  source_ids?: string[];
  confidence?: number;
  created_at?: string;
  updated_at?: string;
}

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

export interface ViewportState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface BoundaryFeatureProperties {
  name: string;
  admin_level: 'empire' | 'province' | 'prefecture' | 'county';
  year: number;
  source: string;
  note?: string;
}

export interface BoundaryFeature extends Feature<Polygon | MultiPolygon> {
  id: string;
  properties: BoundaryFeatureProperties;
}

export interface BoundaryGeoJSON extends FeatureCollection<Polygon | MultiPolygon> {
  name: string;
  period: string;
  valid_from: number;
  valid_to: number;
  description: string;
  features: BoundaryFeature[];
}

export interface BoundaryMapping {
  file: string;
  validFrom: number;
  validTo: number;
  name: string;
  period: string;
}

export interface MapInteractionInfo {
  object?: BoundaryFeature;
  x: number;
  y: number;
  coordinate: [number, number];
}

export interface LayerStyle {
  fillColor: [number, number, number, number];
  lineColor: [number, number, number];
  lineWidth: number;
}
