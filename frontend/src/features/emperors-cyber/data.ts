import { loadJsonData } from '@/utils/services/dataLoaders';

import type { CyberEmperor, DynastyConfig, DynastyData, DynastyItem, Ruler } from './types';

const CYBER_COLORS = [
  '#00f0ff', '#ff2d55', '#ff9500', '#ffcc00', '#34c759',
  '#5ac8fa', '#ff3b30', '#af52de', '#5856d6', '#007aff',
  '#ff6b35', '#ffd60a', '#30d158', '#64d2ff', '#bf5af2',
  '#ff453a', '#32ade6', '#ac8e68', '#ff6482', '#66d4cf',
  '#ffd426', '#a2845e', '#ff375f', '#5e5ce6',
];

function extractRulers(dynasty: DynastyData): CyberEmperor[] {
  const results: CyberEmperor[] = [];

  const addRulers = (rulers: Ruler[] | undefined) => {
    if (!rulers) return;

    rulers.forEach((ruler, idx) => {
      results.push({
        id: `${dynasty.id}-${idx}`,
        name: ruler.name,
        title: ruler.title,
        dynasty: dynasty.name,
        dynastyId: dynasty.id,
        period: dynasty.period,
        yearNames: ruler.yearNames?.map((yearName) => yearName.name).filter(Boolean) || [],
        events: ruler.events?.map((event) => event.description).filter(Boolean) || [],
        summary: dynasty.summary || '',
      });
    });
  };

  addRulers(dynasty.rulers);
  dynasty.subDynasties?.forEach((subDynasty) => addRulers(subDynasty.rulers));

  return results;
}

export function getEmperorDisplayName(emperor: Pick<CyberEmperor, 'name' | 'title'>) {
  return emperor.name || emperor.title || '未选中';
}

export async function loadEmperorsCyberData(): Promise<{
  dynasties: DynastyItem[];
  emperors: CyberEmperor[];
}> {
  const config = await loadJsonData<{ dynasties: DynastyConfig[] }>('/data/json/chinese-dynasties.json');

  if (!config) {
    return { dynasties: [], emperors: [] };
  }

  const dynasties = config.dynasties.map((dynasty, index) => ({
    id: dynasty.id,
    name: dynasty.name,
    era: dynasty.period,
    color: CYBER_COLORS[index % CYBER_COLORS.length] ?? '#00f0ff',
  }));

  const emperors: CyberEmperor[] = [];

  for (const dynasty of config.dynasties) {
    const data = await loadJsonData<DynastyData>(`/data/json/${dynasty.dataFile}`);
    if (data) {
      emperors.push(...extractRulers(data));
    }
  }

  return { dynasties, emperors };
}

export function getDynastyColor(dynastyId: string, dynasties: DynastyItem[]): string {
  return dynasties.find((dynasty) => dynasty.id === dynastyId)?.color || '#00f0ff';
}
