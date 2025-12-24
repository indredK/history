import type { MingFigure } from './types';
import { createUnifiedService } from '@/utils/services/serviceFactory';
import type { MingFigureService } from './mingService';
import { mingFigureServiceHelper } from './mingService';

// 明朝人物模拟数据 (简化版本)
const mingFigureMockData: MingFigure[] = [
  {
    id: 'zhu-yuanzhang',
    name: '朱元璋',
    courtesy: '国瑞',
    birthYear: 1328,
    deathYear: 1398,
    role: 'emperor',
    positions: ['明太祖', '洪武皇帝'],
    biography: '明朝开国皇帝，出身贫农，参加红巾军起义，最终推翻元朝统治，建立明朝。',
    politicalViews: '重农抑商，加强中央集权，废除丞相制度',
    achievements: ['推翻元朝，建立明朝', '制定《大明律》', '实行卫所制度'],
    events: [
      { name: '鄱阳湖之战', year: 1363, role: '主帅', description: '击败陈友谅，奠定统一基础' },
      { name: '北伐灭元', year: 1368, role: '决策者', description: '派徐达、常遇春北伐，攻克大都' }
    ],
    evaluations: [
      { source: '《明史》', content: '太祖以聪明神武之资，抱济世安民之志，乘时应运，豪杰景从。', author: '张廷玉' }
    ],
    sources: ['《明史》', '《明实录》']
  },
  {
    id: 'zhang-juzheng',
    name: '张居正',
    courtesy: '叔大',
    birthYear: 1525,
    deathYear: 1582,
    role: 'cabinet',
    positions: ['内阁首辅', '太师', '中极殿大学士'],
    faction: '改革派',
    biography: '明朝中后期杰出的政治家、改革家。万历初年任内阁首辅，主持万历新政。',
    politicalViews: '尊主权，课吏职，信赏罚，一号令',
    achievements: ['推行一条鞭法', '清丈全国土地', '整顿吏治'],
    events: [
      { name: '万历新政', year: 1572, role: '主导者', description: '主持全面改革，使国库充盈' }
    ],
    evaluations: [
      { source: '《明史》', content: '居正通识时变，勇于任事。神宗初政，起衰振隳，不可谓非干济才。', author: '张廷玉' }
    ],
    sources: ['《明史》', '《张文忠公全集》']
  },
  {
    id: 'qi-jiguang',
    name: '戚继光',
    courtesy: '元敬',
    birthYear: 1528,
    deathYear: 1588,
    role: 'general',
    positions: ['蓟州总兵', '左都督'],
    biography: '明朝杰出的军事家、民族英雄。创建戚家军，平定东南沿海倭患。',
    politicalViews: '强军卫国',
    achievements: ['创建戚家军', '平定东南倭患', '镇守蓟州边防'],
    events: [
      { name: '台州大捷', year: 1561, role: '主帅', description: '九战九捷，歼灭倭寇' }
    ],
    evaluations: [
      { source: '《明史》', content: '继光用兵，威名震寰宇。然操行不如其父，颇以贿闻。', author: '张廷玉' }
    ],
    sources: ['《明史》', '《纪效新书》']
  },
  {
    id: 'wang-yangming',
    name: '王守仁',
    courtesy: '伯安',
    birthYear: 1472,
    deathYear: 1529,
    role: 'official',
    positions: ['南京兵部尚书', '新建伯'],
    biography: '明朝著名思想家、军事家、教育家，心学集大成者。',
    politicalViews: '知行合一，致良知',
    achievements: ['创立阳明心学', '平定宁王之乱', '创办书院'],
    events: [
      { name: '龙场悟道', year: 1508, role: '悟道者', description: '在贵州龙场悟出心学真谛' }
    ],
    evaluations: [
      { source: '《明史》', content: '守仁天资异敏，年十七谒上饶娄谅，与论朱子格物大旨。', author: '张廷玉' }
    ],
    sources: ['《明史》', '《传习录》']
  }
];

// 数据转换器
function transformJsonToMingFigure(jsonData: any, index: number): MingFigure {
  // 如果是直接使用已转换的对象且包含必需字段
  if (jsonData.birthYear !== undefined && jsonData.achievements && Array.isArray(jsonData.achievements)) {
    return jsonData as MingFigure;
  }
  
  // 处理后端数据或原始 Mock 数据
  const parseArray = (val: any) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(s => s.trim());
    return [];
  };

  return {
    id: jsonData.id || `ming_figure_${jsonData.name?.replace(/\s+/g, '_')}_${index}`,
    name: jsonData.name,
    courtesy: jsonData.courtesy || '',
    birthYear: jsonData.birthYear ?? jsonData.birth_year,
    deathYear: jsonData.deathYear ?? jsonData.death_year,
    role: (jsonData.role as any) || 'other',
    positions: parseArray(jsonData.positions),
    biography: jsonData.biography || '',
    politicalViews: jsonData.politicalViews || jsonData.political_views || '',
    achievements: parseArray(jsonData.achievements),
    events: jsonData.events || [],
    evaluations: jsonData.evaluations || [],
    sources: jsonData.sources || []
  };
}

// 创建统一服务
const unifiedService = createUnifiedService<MingFigure>(
  '/ming-figures',
  '/data/json/ming_figures.json',
  transformJsonToMingFigure,
  { hasGetById: true }
);

// 实现明朝人物服务
export const mingFigureApi: MingFigureService = {
  ...unifiedService,
  getMingFigures: () => unifiedService.getAll(),
  getMingFigureById: (id: string) => unifiedService.getById!(id),
  
  // 获取所有角色类型
  getRoleTypes: () => {
    const roles = new Set<string>();
    mingFigureMockData.forEach(figure => roles.add(figure.role));
    return Array.from(roles);
  },
  
  // 获取所有派系
  getFactions: () => {
    const factions = new Set<string>();
    mingFigureMockData.forEach(figure => {
      if (figure.faction) factions.add(figure.faction);
    });
    return Array.from(factions);
  },
  
  // 数据处理方法（代理到辅助类）
  filterByRole: mingFigureServiceHelper.filterByRole,
  filterByPeriod: mingFigureServiceHelper.filterByPeriod,
  filterByFaction: mingFigureServiceHelper.filterByFaction,
  searchFigures: mingFigureServiceHelper.searchFigures,
  sortFigures: mingFigureServiceHelper.sortFigures,
  filterAndSort: mingFigureServiceHelper.filterAndSort,
  getRoleLabel: mingFigureServiceHelper.getRoleLabel,
  formatLifespan: mingFigureServiceHelper.formatLifespan,
  calculateAge: mingFigureServiceHelper.calculateAge
};

// 保持向后兼容的导出
export const getMingFigures = () => mingFigureApi.getMingFigures();
export const getMingFigureById = (id: string) => mingFigureApi.getMingFigureById(id);
export const getRoleTypes = () => mingFigureApi.getRoleTypes();
export const getFactions = () => mingFigureApi.getFactions();

