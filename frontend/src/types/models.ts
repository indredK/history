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
