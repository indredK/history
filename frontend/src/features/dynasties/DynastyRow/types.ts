/**
 * 朝代行组件 —— 共享类型
 */

export interface DynastyEvent {
  description: string;
  mapUrl?: string;
}

export interface YearName {
  name: string;
  duration: string;
  ganZhi: string;
  changeMonth: string;
  startYear: string;
  note?: string;
}

export interface Ruler {
  title: string;
  name: string;
  yearName?: string;
  yearNames?: YearName[];
  duration?: string;
  ganZhi?: string;
  changeMonth?: string;
  startYear?: string;
  events: DynastyEvent[];
}

export interface SubDynasty {
  id: string;
  name: string;
  period: string;
  rulers?: Ruler[];
  dynasties?: SubDynasty[];
}

export interface Dynasty {
  id: string;
  name: string;
  period: string;
  note?: string;
  summary?: string;
  rulers?: Ruler[];
  subDynasties?: SubDynasty[];
  /** 五代特殊结构,直接嵌套 dynasties */
  dynasties?: SubDynasty[];
}

export interface ResponsiveFlags {
  isMobile?: boolean | undefined;
  isSmallMobile?: boolean | undefined;
}
