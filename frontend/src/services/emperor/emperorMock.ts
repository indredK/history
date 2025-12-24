import type { Emperor } from './types';

// Mock 帝王数据
const mockEmperors: Emperor[] = [
  {
    id: 'emp_qin_shihuang',
    name: '嬴政',
    templeName: '始皇帝',
    dynasty: '秦',
    reignStart: -221,
    reignEnd: -210,
    eraNames: [
      { name: '始皇', startYear: -221, endYear: -210 }
    ],
    achievements: ['统一六国', '统一文字', '修建长城', '统一度量衡'],
    failures: ['焚书坑儒', '暴政'],
    evaluations: [
      {
        source: '史记',
        content: '功过参半的千古一帝',
        author: '司马迁'
      }
    ],
    biography: '中国历史上第一个皇帝，统一六国，建立了中央集权制度。',
    sources: ['史记', '资治通鉴']
  }
];

// 模拟网络延迟
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const getEmperors = async (): Promise<{ data: Emperor[] }> => {
  await delay();
  return { data: mockEmperors };
};

export const getEmperorById = async (id: string): Promise<{ data: Emperor | null }> => {
  await delay();
  const emperor = mockEmperors.find(emp => emp.id === id);
  return { data: emperor || null };
};

export const getDynasties = (): string[] => {
  return Array.from(new Set(mockEmperors.map(emp => emp.dynasty)));
};

export const emperorMock = {
  getEmperors,
  getEmperor: getEmperorById,
};