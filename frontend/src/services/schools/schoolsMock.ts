import type { PhilosophicalSchool } from './types';

// Mock 思想流派数据
const mockSchools: PhilosophicalSchool[] = [
  {
    id: 'school_confucianism',
    name: '儒家',
    name_en: 'Confucianism',
    founder: '孔子',
    founderEn: 'Confucius',
    foundingYear: -551,
    foundingPeriod: '春秋时期',
    coreBeliefs: ['仁', '义', '礼', '智', '信'],
    keyTexts: ['论语', '孟子', '大学', '中庸'],
    representativeFigures: [
      {
        id: 'fig_confucius',
        name: '孔子',
        name_en: 'Confucius',
        period: '春秋时期',
        contribution: '创立儒家思想'
      },
      {
        id: 'fig_mencius',
        name: '孟子',
        name_en: 'Mencius',
        period: '战国时期',
        contribution: '发展儒家思想，提出性善论'
      }
    ],
    classicWorks: [
      {
        id: 'work_analects',
        title: '论语',
        title_en: 'The Analects',
        author: '孔子弟子',
        description: '记录孔子言行的经典著作'
      }
    ],
    description: '以仁为核心的伦理哲学体系',
    influence: '对中国文化产生了深远影响，成为中国传统文化的主流思想',
    color: '#FF6B6B'
  },
  {
    id: 'school_taoism',
    name: '道家',
    name_en: 'Taoism',
    founder: '老子',
    founderEn: 'Laozi',
    foundingYear: -600,
    foundingPeriod: '春秋时期',
    coreBeliefs: ['道法自然', '无为而治', '阴阳平衡'],
    keyTexts: ['道德经', '庄子'],
    representativeFigures: [
      {
        id: 'fig_laozi',
        name: '老子',
        name_en: 'Laozi',
        period: '春秋时期',
        contribution: '创立道家思想'
      },
      {
        id: 'fig_zhuangzi',
        name: '庄子',
        name_en: 'Zhuangzi',
        period: '战国时期',
        contribution: '发展道家哲学，强调逍遥自在'
      }
    ],
    classicWorks: [
      {
        id: 'work_tao_te_ching',
        title: '道德经',
        title_en: 'Tao Te Ching',
        author: '老子',
        description: '道家思想的根本经典'
      }
    ],
    description: '强调顺应自然、无为而治的哲学思想',
    influence: '对中国哲学、宗教、文学、艺术等领域都有重要影响',
    color: '#4ECDC4'
  }
];

// 模拟网络延迟
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const getSchools = async (): Promise<{ data: PhilosophicalSchool[] }> => {
  await delay();
  return { data: mockSchools };
};

export const getSchoolById = async (id: string): Promise<{ data: PhilosophicalSchool | null }> => {
  await delay();
  const school = mockSchools.find(s => s.id === id);
  return { data: school || null };
};

export const schoolsMock = {
  getSchools,
  getSchool: getSchoolById,
};