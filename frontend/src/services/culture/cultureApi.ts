import type { DynastiesService } from './cultureService';
import type { Dynasty } from './types';
import { loadJsonData } from '@/utils/services/dataLoaders';

interface TimelineByDynastyIndex {
  generatedAt: string;
  dynasties: Array<{
    id: string;
    name: string;
    name_en: string | null;
    slug: string;
    color: string | null;
    file: string;
    startYear: number;
    endYear: number | null;
    description: string | null;
    eventCount: number;
  }>;
}

// 从 timeline-by-dynasty 索引文件加载，无需额外转换
async function getDynastiesFromIndex(): Promise<{ data: Dynasty[] }> {
  const index = await loadJsonData<TimelineByDynastyIndex>(
    '/data/json/timeline-by-dynasty/index.json'
  );
  const dynasties: Dynasty[] = index.dynasties.map((entry) => {
    const d: Dynasty = {
      id: entry.id,
      name: entry.name,
      startYear: entry.startYear,
    };
    if (entry.endYear != null) d.endYear = entry.endYear;
    if (entry.description) d.description = entry.description;
    if (entry.name_en) d.name_en = entry.name_en;
    if (entry.color) d.color = entry.color;
    return d;
  });
  return { data: dynasties };
}

const getAll = async (): Promise<{ data: Dynasty[] }> => getDynastiesFromIndex();

export const dynastiesApi: DynastiesService = {
  getDynasties: getDynastiesFromIndex,
  getAll,
};
