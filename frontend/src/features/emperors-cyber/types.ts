export interface DynastyConfig {
  id: string;
  name: string;
  period: string;
  dataFile: string;
}

export interface RulerEvent {
  description: string;
  mapUrl?: string;
}

export interface YearName {
  name: string;
  duration: string;
  startYear: string;
}

export interface Ruler {
  title: string;
  name: string;
  yearName?: string;
  duration?: string;
  startYear?: string;
  yearNames?: YearName[];
  events?: RulerEvent[];
}

export interface DynastyData {
  id: string;
  name: string;
  period: string;
  summary?: string;
  rulers?: Ruler[];
  subDynasties?: {
    id: string;
    name: string;
    period: string;
    rulers?: Ruler[];
  }[];
}

export interface DynastyItem {
  id: string;
  name: string;
  era: string;
  color: string;
  startYearLabel: string;
  endYearLabel: string;
  startYearValue: number | null;
  endYearValue: number | null;
}

export interface CyberEmperor {
  id: string;
  name: string;
  title: string;
  dynasty: string;
  dynastyId: string;
  period: string;
  yearNames: string[];
  events: string[];
  summary: string;
  startYearLabel: string;
  endYearLabel: string;
  startYearValue: number | null;
  endYearValue: number | null;
  sortYearValue: number;
}
