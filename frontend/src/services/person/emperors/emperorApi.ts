import type { EmperorService } from './emperorService';
import { createUnifiedService } from '../../base/serviceFactory';
import type { Emperor } from './types';
import { emperorServiceHelper } from './emperorService';

// JSON 数据中的人物接口
interface PersonData {
  name: string;
  name_en: string;
  birth_year: number;
  birth_month: number;
  death_year: number;
  death_month: number;
  roles: string;
  biography: string;
  source: string;
}

// 朝代映射表
const DYNASTY_MAP: Record<string, string> = {
  '秦始皇': '秦',
  '汉武帝': '汉',
  '唐太宗': '唐',
  '唐玄宗': '唐',
  '武则天': '唐',
  '康熙': '清',
  '乾隆': '清',
};

// 庙号映射表
const TEMPLE_NAME_MAP: Record<string, string> = {
  '秦始皇': '始皇帝',
  '汉武帝': '武帝',
  '唐太宗': '太宗',
  '唐玄宗': '玄宗',
  '武则天': '则天大圣皇帝',
  '康熙': '圣祖',
  '乾隆': '高宗',
};

// 主要成就映射表
const ACHIEVEMENTS_MAP: Record<string, string[]> = {
  '秦始皇': ['统一六国', '统一文字', '统一度量衡', '修建长城', '建立郡县制'],
  '汉武帝': ['开拓丝绸之路', '击败匈奴', '推行推恩令', '独尊儒术'],
  '唐太宗': ['贞观之治', '虚心纳谏', '完善科举制', '民族融合政策'],
  '唐玄宗': ['开元盛世', '文化繁荣', '经济发展', '疆域辽阔'],
  '武则天': ['选贤任能', '发展农业', '稳定边疆', '推行科举'],
  '康熙': ['平定三藩', '收复台湾', '抗击沙俄', '康乾盛世'],
  '乾隆': ['十全武功', '文化繁荣', '疆域最大', '人口增长'],
};

// 主要失误映射表
const FAILURES_MAP: Record<string, string[]> = {
  '秦始皇': ['焚书坑儒', '严刑峻法', '大兴土木', '暴政苛税'],
  '汉武帝': ['穷兵黩武', '巫蛊之祸', '财政困难'],
  '唐太宗': ['征伐高句丽失败'],
  '唐玄宗': ['安史之乱', '宠幸杨贵妃', '后期政治腐败'],
  '武则天': ['酷吏政治', '大兴土木'],
  '康熙': ['文字狱', '海禁政策'],
  '乾隆': ['闭关锁国', '文字狱', '贪污腐败', '人口压力'],
};

// 数据转换器
function transformJsonToEmperor(jsonPerson: any, index: number): Emperor {
  // 处理后端 DTO 格式
  if (jsonPerson.dynastyId || jsonPerson.reignStart !== undefined) {
    const historicalEval = jsonPerson.historicalEvaluation;
    const evaluations = historicalEval ? [{
      source: historicalEval.source || '历史评估',
      content: historicalEval.content || '',
      author: historicalEval.author || '匿名'
    }] : [];

    return {
      id: jsonPerson.id,
      name: jsonPerson.name,
      templeName: jsonPerson.templeName,
      dynasty: jsonPerson.dynasty?.name || '未知', // 后端可能包含关联的朝代对象
      reignStart: jsonPerson.reignStart,
      reignEnd: jsonPerson.reignEnd,
      eraNames: jsonPerson.eraNames || [],
      achievements: jsonPerson.achievements || [],
      failures: jsonPerson.failures || [],
      evaluations: jsonPerson.evaluations || evaluations,
      biography: jsonPerson.biography || '',
      sources: jsonPerson.sources || []
    };
  }

  // 以下是原有处理 Mock 数据的逻辑
  const person = jsonPerson as PersonData;
  
  // 检查是否为帝王角色
  const isEmperor = jsonPerson.roles?.includes('emperor');
  const dynasty = isEmperor ? (DYNASTY_MAP[person.name] || '未知') : '未知';
  const templeName = isEmperor ? TEMPLE_NAME_MAP[person.name] : undefined;
  const achievements = isEmperor ? (ACHIEVEMENTS_MAP[person.name] || []) : [];
  const failures = isEmperor ? (FAILURES_MAP[person.name] || []) : [];
  
  // 估算在位时间（基于历史常识）
  let reignStart = person.birth_year + 20; // 默认20岁开始执政
  let reignEnd = person.death_year;
  
  // 特殊情况调整
  if (person.name === '秦始皇') {
    reignStart = -221; // 统一六国的年份
  } else if (person.name === '汉武帝') {
    reignStart = -140; // 实际即位年份
  } else if (person.name === '唐太宗') {
    reignStart = 626; // 玄武门之变后即位
  } else if (person.name === '唐玄宗') {
    reignStart = 712; // 实际即位年份
  } else if (person.name === '武则天') {
    reignStart = 690; // 建立武周
    reignEnd = 705; // 退位年份
  } else if (person.name === '康熙') {
    reignStart = 1661; // 实际即位年份
  } else if (person.name === '乾隆') {
    reignStart = 1735; // 实际即位年份
  }
  
  return {
    id: `emp_${person.name_en?.toLowerCase().replace(/\s+/g, '_') || `unknown_${index}`}`,
    name: person.name,
    ...(templeName && { templeName }),
    dynasty,
    reignStart,
    reignEnd,
    eraNames: [
      {
        name: templeName || person.name,
        startYear: reignStart,
        endYear: reignEnd
      }
    ],
    achievements,
    failures,
    evaluations: [
      {
        source: person.source,
        content: person.biography,
        author: '史官'
      }
    ],
    biography: person.biography,
    sources: [person.source]
  };
}

// 创建统一服务
const unifiedService = createUnifiedService<Emperor>(
  '/emperors',
  '/data/json/persons.json',
  transformJsonToEmperor,
  { hasGetById: true }
);

// 实现帝王服务
export const emperorApi: EmperorService = {
  ...unifiedService,
  getEmperors: () => unifiedService.getAll(),
  getEmperorById: (id: string) => unifiedService.getById!(id),
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