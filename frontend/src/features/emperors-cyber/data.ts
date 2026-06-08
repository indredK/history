import { loadJsonData } from '@/utils/services/dataLoaders';

import type { CyberEmperor, DynastyItem } from './types';

interface FlatYearRow {
  id: string;
  year: number;
  polity: string;
  ruler: string;
  rulerAlias: string;
  eraName: string;
  eraFullName: string;
  sexagenary: string;
}

interface FlatApiResponse {
  yearRows?: FlatYearRow[];
}

interface DynastyAccumulator {
  name: string;
  startYear: number;
  endYear: number;
  emperors: Map<string, EmperorAccumulator>;
}

interface EmperorAccumulator {
  alias: string;
  ruler: string;
  startYear: number;
  endYear: number;
  yearNames: string[];
}

const RESPONSE_FILE_COUNT = 9;

const CYBER_COLORS = [
  '#00f0ff', '#ff2d55', '#ff9500', '#ffcc00', '#34c759',
  '#5ac8fa', '#ff3b30', '#af52de', '#5856d6', '#007aff',
  '#ff6b35', '#ffd60a', '#30d158', '#64d2ff', '#bf5af2',
  '#ff453a', '#32ade6', '#ac8e68', '#ff6482', '#66d4cf',
  '#ffd426', '#a2845e', '#ff375f', '#5e5ce6',
];

function formatHistoricalYear(year: number | null | undefined) {
  if (typeof year !== 'number' || !Number.isFinite(year)) {
    return '';
  }

  if (year < 0) {
    return `前${Math.abs(Math.trunc(year))}`;
  }

  return String(Math.trunc(year));
}

function formatPeriod(startYear: number, endYear: number) {
  const startLabel = formatHistoricalYear(startYear);
  const endLabel = formatHistoricalYear(endYear);

  return startYear === endYear ? startLabel : `${startLabel}-${endLabel}`;
}

function compareRows(left: FlatYearRow, right: FlatYearRow) {
  if (left.year !== right.year) {
    return left.year - right.year;
  }

  return Number(left.id) - Number(right.id);
}

async function loadFlatYearRows() {
  const responses = await Promise.allSettled(
    Array.from({ length: RESPONSE_FILE_COUNT }, (_, index) => (
      loadJsonData<FlatApiResponse>(`/data/json/response${index + 1}.json`)
    )),
  );

  return responses
    .flatMap((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value.yearRows ?? [];
      }

      console.warn(`加载 response${index + 1}.json 失败:`, result.reason);
      return [];
    })
    .filter((row) => row.polity && (row.rulerAlias || row.ruler))
    .sort(compareRows);
}

function buildCyberDataset(rows: FlatYearRow[]) {
  const dynasties = new Map<string, DynastyAccumulator>();

  rows.forEach((row) => {
    const polity = row.polity.trim();
    const dynasty = dynasties.get(polity) ?? {
      name: polity,
      startYear: row.year,
      endYear: row.year,
      emperors: new Map<string, EmperorAccumulator>(),
    };

    dynasty.startYear = Math.min(dynasty.startYear, row.year);
    dynasty.endYear = Math.max(dynasty.endYear, row.year);

    const emperorKey = `${row.rulerAlias || row.ruler}::${row.ruler}`;
    const emperor = dynasty.emperors.get(emperorKey) ?? {
      alias: row.rulerAlias || row.ruler,
      ruler: row.ruler,
      startYear: row.year,
      endYear: row.year,
      yearNames: [],
    };

    emperor.startYear = Math.min(emperor.startYear, row.year);
    emperor.endYear = Math.max(emperor.endYear, row.year);

    const eraName = row.eraName?.trim() || row.eraFullName?.trim();
    if (eraName && !emperor.yearNames.includes(eraName)) {
      emperor.yearNames.push(eraName);
    }

    dynasty.emperors.set(emperorKey, emperor);
    dynasties.set(polity, dynasty);
  });

  const orderedDynasties = Array.from(dynasties.values())
    .sort((left, right) => left.startYear - right.startYear);

  const dynastyItems: DynastyItem[] = orderedDynasties.map((dynasty, index) => ({
    id: `dynasty-${index}`,
    name: dynasty.name,
    era: formatPeriod(dynasty.startYear, dynasty.endYear),
    color: CYBER_COLORS[index % CYBER_COLORS.length] ?? '#00f0ff',
    startYearLabel: formatHistoricalYear(dynasty.startYear),
    endYearLabel: formatHistoricalYear(dynasty.endYear),
    startYearValue: dynasty.startYear,
    endYearValue: dynasty.endYear,
  }));

  const emperorItems: CyberEmperor[] = dynastyItems.flatMap((dynasty) => {
    const dynastyData = dynasties.get(dynasty.name);

    if (!dynastyData) {
      return [];
    }

    return Array.from(dynastyData.emperors.values())
      .sort((left, right) => left.startYear - right.startYear)
      .map((emperor, index) => ({
        id: `${dynasty.id}-emperor-${index}`,
        name: emperor.alias,
        title: emperor.ruler,
        dynasty: dynasty.name,
        dynastyId: dynasty.id,
        period: formatPeriod(emperor.startYear, emperor.endYear),
        yearNames: emperor.yearNames,
        events: [],
        summary: '',
        startYearLabel: formatHistoricalYear(emperor.startYear),
        endYearLabel: formatHistoricalYear(emperor.endYear),
        startYearValue: emperor.startYear,
        endYearValue: emperor.endYear,
        sortYearValue: emperor.startYear,
      }));
  });

  return {
    dynasties: dynastyItems,
    emperors: emperorItems,
  };
}

export function getEmperorDisplayName(emperor: Pick<CyberEmperor, 'name' | 'title'>) {
  return emperor.name || emperor.title || '未选中';
}

export async function loadEmperorsCyberData(): Promise<{
  dynasties: DynastyItem[];
  emperors: CyberEmperor[];
}> {
  const rows = await loadFlatYearRows();

  if (rows.length === 0) {
    return { dynasties: [], emperors: [] };
  }

  return buildCyberDataset(rows);
}

export function getDynastyColor(dynastyId: string, dynasties: DynastyItem[]): string {
  return dynasties.find((dynasty) => dynasty.id === dynastyId)?.color || '#00f0ff';
}
