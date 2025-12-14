import type { Feature, FeatureCollection, Polygon, MultiPolygon } from 'geojson';

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
