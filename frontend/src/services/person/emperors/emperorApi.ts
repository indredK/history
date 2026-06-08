import type { EmperorService } from './emperorService';
import { createUnifiedService } from '../../base/serviceFactory';
import type { Emperor, EraName, HistoricalEvaluation } from './types';
import { emperorServiceHelper } from './emperorService';

// JSON 数据中的人物接口
interface PersonData {
  name?: string;
  name_en?: string;
  birth_year?: number;
  death_year?: number;
  roles?: unknown;
  biography?: string;
  source?: string;
}

type RawRecord = Record<string, unknown>;

const UNKNOWN_DYNASTY = '未知';

// 朝代映射表
const DYNASTY_MAP: Record<string, string> = {
  '秦始皇': '秦',
  '刘邦': '西汉',
  '汉武帝': '西汉',
  '唐太宗': '唐',
  '李世民': '唐',
  '唐玄宗': '唐',
  '武则天': '唐',
  '忽必烈': '元',
  '朱元璋': '明',
  '康熙': '清',
  '康熙帝': '清',
  '乾隆': '清',
  '乾隆帝': '清',
};

// 庙号映射表
const TEMPLE_NAME_MAP: Record<string, string> = {
  '秦始皇': '始皇帝',
  '刘邦': '高祖',
  '汉武帝': '武帝',
  '唐太宗': '太宗',
  '李世民': '太宗',
  '唐玄宗': '玄宗',
  '武则天': '则天大圣皇帝',
  '忽必烈': '世祖',
  '朱元璋': '太祖',
  '康熙': '圣祖',
  '康熙帝': '圣祖',
  '乾隆': '高宗',
  '乾隆帝': '高宗',
};

// 主要成就映射表
const ACHIEVEMENTS_MAP: Record<string, string[]> = {
  '秦始皇': ['统一六国', '统一文字', '统一度量衡', '修建长城', '建立郡县制'],
  '刘邦': ['建立西汉', '约法三章', '休养生息'],
  '汉武帝': ['开拓丝绸之路', '击败匈奴', '推行推恩令', '独尊儒术'],
  '唐太宗': ['贞观之治', '虚心纳谏', '完善科举制', '民族融合政策'],
  '李世民': ['贞观之治', '虚心纳谏', '完善科举制', '民族融合政策'],
  '唐玄宗': ['开元盛世', '文化繁荣', '经济发展', '疆域辽阔'],
  '武则天': ['选贤任能', '发展农业', '稳定边疆', '推行科举'],
  '忽必烈': ['建立元朝', '统一南北', '推行行省制度'],
  '朱元璋': ['建立明朝', '整顿吏治', '恢复农业生产'],
  '康熙': ['平定三藩', '收复台湾', '抗击沙俄', '康乾盛世'],
  '康熙帝': ['平定三藩', '收复台湾', '抗击沙俄', '康乾盛世'],
  '乾隆': ['十全武功', '文化繁荣', '疆域最大', '人口增长'],
  '乾隆帝': ['十全武功', '文化繁荣', '疆域最大', '人口增长'],
};

// 主要失误映射表
const FAILURES_MAP: Record<string, string[]> = {
  '秦始皇': ['焚书坑儒', '严刑峻法', '大兴土木', '暴政苛税'],
  '刘邦': ['诛杀功臣争议'],
  '汉武帝': ['穷兵黩武', '巫蛊之祸', '财政困难'],
  '唐太宗': ['征伐高句丽失败'],
  '李世民': ['征伐高句丽失败'],
  '唐玄宗': ['安史之乱', '宠幸杨贵妃', '后期政治腐败'],
  '武则天': ['酷吏政治', '大兴土木'],
  '忽必烈': ['财政负担加重', '对外征伐失利'],
  '朱元璋': ['严刑峻法', '诛杀功臣'],
  '康熙': ['文字狱', '海禁政策'],
  '康熙帝': ['文字狱', '海禁政策'],
  '乾隆': ['闭关锁国', '文字狱', '贪污腐败', '人口压力'],
  '乾隆帝': ['闭关锁国', '文字狱', '贪污腐败', '人口压力'],
};

function isRecord(value: unknown): value is RawRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function readNullableNumberField(source: RawRecord, keys: string[]): number | null | undefined {
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
    const value = source[key];
    if (value === null || value === undefined || value === '') return null;
    return readNumber(value) ?? null;
  }
  return undefined;
}

function splitRoles(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => readString(item)).filter(Boolean);
  }
  return readString(value)
    .split(/[,，、|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function readStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => readString(item)).filter(Boolean);
  }
  const text = readString(value);
  return text ? [text] : [];
}

function readDynastyName(source: RawRecord): string {
  const dynasty = source.dynasty;
  if (typeof dynasty === 'string') return readString(dynasty);
  if (isRecord(dynasty)) return readString(dynasty.name);
  return readString(source.dynastyName ?? source.dynasty_name);
}

function normalizeEraNames(value: unknown): EraName[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((item) => {
      const name = readString(item.name);
      const startYear = readNumber(item.startYear ?? item.start_year);
      if (!name || startYear === undefined) return null;
      const era: EraName = { name, startYear };
      const endYear = readNullableNumberField(item, ['endYear', 'end_year']);
      if (endYear !== undefined) era.endYear = endYear;
      const description = readString(item.description);
      if (description) era.description = description;
      return era;
    })
    .filter((item): item is EraName => Boolean(item));
}

function normalizeEvaluations(source: RawRecord): HistoricalEvaluation[] {
  if (Array.isArray(source.evaluations)) {
    return source.evaluations
      .filter(isRecord)
      .map((item) => ({
        source: readString(item.source) || '历史评估',
        content: readString(item.content),
        author: readString(item.author) || null,
      }))
      .filter((item) => item.content);
  }

  const historicalEvaluation = source.historicalEvaluation;
  if (!isRecord(historicalEvaluation)) return [];
  const detailParts = [
    readString(historicalEvaluation.summary),
    ...readStringArray(historicalEvaluation.positives).map((item) => `功绩：${item}`),
    ...readStringArray(historicalEvaluation.negatives).map((item) => `争议：${item}`),
    readString(historicalEvaluation.impact),
  ].filter(Boolean);
  const content = readString(historicalEvaluation.content) || detailParts.join('；');
  if (!content) return [];
  return [{
    source: readString(historicalEvaluation.source) || '历史评估',
    content,
    author: readString(historicalEvaluation.author) || null,
  }];
}

function transformApiEmperor(source: RawRecord, index: number): Emperor {
  const name = readString(source.name) || `未命名帝王 ${index + 1}`;
  const reignStart = readNumber(source.reignStart ?? source.reign_start) ?? 0;
  const rawReignEnd = readNullableNumberField(source, ['reignEnd', 'reign_end']);
  const reignEnd = rawReignEnd !== undefined
    ? rawReignEnd
    : readNumber(source.deathYear ?? source.death_year) ?? null;
  const dynasty = readDynastyName(source) || UNKNOWN_DYNASTY;

  const emperor: Emperor = {
    id: readString(source.id) || `emperor-${index + 1}`,
    name,
    dynasty,
    reignStart,
    reignEnd,
    eraNames: normalizeEraNames(source.eraNames ?? source.era_names),
    achievements: readStringArray(source.achievements),
    failures: readStringArray(source.failures),
    evaluations: normalizeEvaluations(source),
    sources: readStringArray(source.sources),
  };

  const templeName = readString(source.templeName ?? source.temple_name);
  if (templeName) emperor.templeName = templeName;
  const posthumousName = readString(source.posthumousName ?? source.posthumous_name);
  if (posthumousName) emperor.posthumousName = posthumousName;
  const dynastyPeriod = readString(source.dynastyPeriod ?? source.dynasty_period);
  if (dynastyPeriod) emperor.dynastyPeriod = dynastyPeriod;
  const biography = readString(source.biography);
  if (biography) emperor.biography = biography;
  const portraitUrl = readString(source.portraitUrl ?? source.portrait_url);
  if (portraitUrl) emperor.portraitUrl = portraitUrl;

  return emperor;
}

function transformStaticPersonToEmperor(source: RawRecord, index: number): Emperor {
  const person = source as PersonData;
  const name = readString(person.name) || `未命名帝王 ${index + 1}`;
  const isEmperor = splitRoles(person.roles).includes('emperor');
  const dynasty = isEmperor ? DYNASTY_MAP[name] || UNKNOWN_DYNASTY : UNKNOWN_DYNASTY;
  const templeName = isEmperor ? TEMPLE_NAME_MAP[name] : undefined;
  const achievements = isEmperor ? ACHIEVEMENTS_MAP[name] || [] : [];
  const failures = isEmperor ? FAILURES_MAP[name] || [] : [];
  const birthYear = readNumber(person.birth_year) ?? 0;
  const deathYear = readNumber(person.death_year) ?? null;

  let reignStart = birthYear + 20;
  let reignEnd = deathYear;

  if (name === '秦始皇') {
    reignStart = -221;
  } else if (name === '汉武帝') {
    reignStart = -140;
  } else if (name === '唐太宗' || name === '李世民') {
    reignStart = 626;
  } else if (name === '唐玄宗') {
    reignStart = 712;
  } else if (name === '武则天') {
    reignStart = 690;
    reignEnd = 705;
  } else if (name === '忽必烈') {
    reignStart = 1271;
  } else if (name === '朱元璋') {
    reignStart = 1368;
  } else if (name === '康熙' || name === '康熙帝') {
    reignStart = 1661;
  } else if (name === '乾隆' || name === '乾隆帝') {
    reignStart = 1735;
  } else if (name === '刘邦') {
    reignStart = -202;
  }

  const sourceText = readString(person.source);
  return {
    id: `emp_${readString(person.name_en).toLowerCase().replace(/\s+/g, '_') || `${name}_${index}`}`,
    name,
    ...(templeName ? { templeName } : {}),
    dynasty,
    reignStart,
    reignEnd,
    eraNames: [
      {
        name: templeName || name,
        startYear: reignStart,
        endYear: reignEnd,
      },
    ],
    achievements,
    failures,
    evaluations: sourceText || readString(person.biography)
      ? [
          {
            source: sourceText || '人物档案',
            content: readString(person.biography) || '暂无评价',
            author: '史官',
          },
        ]
      : [],
    biography: readString(person.biography),
    sources: sourceText ? [sourceText] : [],
  };
}

function isDisplayableEmperor(emperor: Emperor): boolean {
  return emperor.dynasty !== UNKNOWN_DYNASTY;
}

// 数据转换器
function transformJsonToEmperor(jsonPerson: unknown, index: number): Emperor {
  const source = isRecord(jsonPerson) ? jsonPerson : {};

  // 处理后端 DTO 格式
  if (source.dynastyId || source.reignStart !== undefined || source.reign_start !== undefined) {
    return transformApiEmperor(source, index);
  }

  return transformStaticPersonToEmperor(source, index);
}

// 创建统一服务
const unifiedService = createUnifiedService<Emperor>(
  '/emperors',
  '/data/json/persons.json',
  transformJsonToEmperor,
  { hasGetById: true }
);

async function getDisplayableEmperors(): Promise<{ data: Emperor[] }> {
  const result = await unifiedService.getAll();
  return { data: result.data.filter(isDisplayableEmperor) };
}

async function getDisplayableEmperorById(id: string): Promise<{ data: Emperor | null }> {
  const result = await unifiedService.getById!(id);
  return {
    data: result.data && isDisplayableEmperor(result.data) ? result.data : null,
  };
}

// 实现帝王服务
export const emperorApi: EmperorService = {
  ...unifiedService,
  getAll: getDisplayableEmperors,
  getById: getDisplayableEmperorById,
  getEmperors: getDisplayableEmperors,
  getEmperorById: getDisplayableEmperorById,
  getDynasties: () => Object.values(DYNASTY_MAP).filter((dynasty, index, self) => self.indexOf(dynasty) === index),
  
  // 数据处理方法（代理到辅助类）
  filterByDynasty: emperorServiceHelper.filterByDynasty,
  searchEmperors: emperorServiceHelper.searchEmperors,
  sortEmperors: emperorServiceHelper.sortEmperors,
  filterAndSort: emperorServiceHelper.filterAndSort,
  formatReignPeriod: emperorServiceHelper.formatReignPeriod,
  formatEraNames: emperorServiceHelper.formatEraNames,
  calculateReignYears: emperorServiceHelper.calculateReignYears,
};

// 保持向后兼容的导出
export const getEmperors = () => emperorApi.getEmperors();
export const getEmperorById = (id: string) => emperorApi.getEmperorById(id);
export const getDynasties = () => emperorApi.getDynasties();

// 导出服务辅助方法（保持向后兼容）
export const emperorService = emperorServiceHelper;
