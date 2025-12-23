import type { CultureService } from './cultureService';
import type { Dynasty } from './types';
import { loadJsonData } from '@/utils/services/dataLoader';

// 转换 JSON 数据为 Dynasty 格式
function transformJsonToDynasty(jsonDynasty: any): Dynasty {
  return {
    id: jsonDynasty.id,
    name: jsonDynasty.name,
    name_en: jsonDynasty.name_en,
    startYear: jsonDynasty.startYear,
    endYear: jsonDynasty.endYear,
    description: jsonDynasty.description,
    color: jsonDynasty.color,
  };
}

// 缓存加载的数据
let cachedDynasties: Dynasty[] | null = null;

// 延迟1秒获取数据
async function delay() {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

export const cultureMock: CultureService = {
  getDynasties: async () => {
    await delay();
    
    if (cachedDynasties) {
      return { data: cachedDynasties };
    }

    const jsonDynasties = await loadJsonData<any>('/data/json/dynasties.json');
    cachedDynasties = jsonDynasties.map(transformJsonToDynasty);
    return { data: cachedDynasties };
  },
};
