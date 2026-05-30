import { loadJsonData } from '@/utils/services/dataLoaders';

import type { CyberEmperor, DynastyConfig, DynastyData, DynastyItem, Ruler } from './types';

const CYBER_COLORS = [
  '#00f0ff', '#ff2d55', '#ff9500', '#ffcc00', '#34c759',
  '#5ac8fa', '#ff3b30', '#af52de', '#5856d6', '#007aff',
  '#ff6b35', '#ffd60a', '#30d158', '#64d2ff', '#bf5af2',
  '#ff453a', '#32ade6', '#ac8e68', '#ff6482', '#66d4cf',
  '#ffd426', '#a2845e', '#ff375f', '#5e5ce6',
];

function normalizeTimeLabel(value: string | undefined) {
  return value?.trim() || '';
}

function parseHistoricalYear(input: string | undefined): number | null {
  const value = normalizeTimeLabel(input);

  if (!value) {
    return null;
  }

  const cleaned = value
    .replace(/约/g, '')
    .replace(/公元前/g, '前')
    .replace(/公元/g, '')
    .replace(/年/g, '')
    .replace(/\s+/g, '');

  const centuryMatch = cleaned.match(/前?(\d+)世纪([初中末])?/);

  if (centuryMatch) {
    const century = Number(centuryMatch[1]);
    const marker = centuryMatch[2];
    const isBeforeCommonEra = cleaned.startsWith('前');
    const base = isBeforeCommonEra ? century * 100 : (century - 1) * 100;
    const offset = marker === '初' ? 0 : marker === '中' ? 50 : marker === '末' ? 90 : 0;

    return isBeforeCommonEra ? -(base - offset) : base + offset;
  }

  const yearMatch = cleaned.match(/前?(\d{1,4})/);

  if (yearMatch) {
    const year = Number(yearMatch[1]);
    return cleaned.startsWith('前') ? -year : year;
  }

  return null;
}

function parsePeriodRange(period: string | undefined) {
  const value = normalizeTimeLabel(period);

  if (!value) {
    return {
      startLabel: '',
      endLabel: '',
      startValue: null,
      endValue: null,
    };
  }

  const [rawStart = '', rawEnd = ''] = value.split('-');
  const startLabel = rawStart.trim();
  const endLabel = rawEnd.trim();
  const startValue = parseHistoricalYear(startLabel);
  const endValue = parseHistoricalYear(endLabel);

  return {
    startLabel,
    endLabel,
    startValue,
    endValue,
  };
}

function getRulerStartYearLabel(ruler: Ruler) {
  if (ruler.yearNames?.[0]?.startYear) {
    return normalizeTimeLabel(ruler.yearNames[0].startYear);
  }

  return normalizeTimeLabel(ruler.startYear);
}

function getRulerStartYearValue(ruler: Ruler) {
  return parseHistoricalYear(getRulerStartYearLabel(ruler));
}

function extractRulers(dynasty: DynastyData): CyberEmperor[] {
  const results: CyberEmperor[] = [];
  const dynastyPeriod = parsePeriodRange(dynasty.period);

  const addRulers = (rulers: Ruler[] | undefined) => {
    if (!rulers) return;

    rulers.forEach((ruler, idx) => {
      const startYearLabel = getRulerStartYearLabel(ruler) || dynastyPeriod.startLabel;
      const startYearValue = getRulerStartYearValue(ruler) ?? dynastyPeriod.startValue;

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
        startYearLabel,
        endYearLabel: dynastyPeriod.endLabel,
        startYearValue,
        endYearValue: dynastyPeriod.endValue,
        sortYearValue: startYearValue ?? dynastyPeriod.startValue ?? idx,
      });
    });
  };

  addRulers(dynasty.rulers);
  dynasty.subDynasties?.forEach((subDynasty) => addRulers(subDynasty.rulers));

  return results.sort((left, right) => left.sortYearValue - right.sortYearValue);
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
    ...(() => {
      const period = parsePeriodRange(dynasty.period);

      return {
        id: dynasty.id,
        name: dynasty.name,
        era: dynasty.period,
        color: CYBER_COLORS[index % CYBER_COLORS.length] ?? '#00f0ff',
        startYearLabel: period.startLabel,
        endYearLabel: period.endLabel,
        startYearValue: period.startValue,
        endYearValue: period.endValue,
      };
    })(),
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
