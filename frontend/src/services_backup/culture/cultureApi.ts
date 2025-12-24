import type { DynastiesService } from './cultureService';
import { createUnifiedService } from '@/utils/services/serviceFactory';
import type { Dynasty } from './types';

// 数据转换器
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

// 创建统一服务
const unifiedService = createUnifiedService<Dynasty>(
  '/dynasties',
  '/data/json/dynasties.json',
  transformJsonToDynasty
);

export const dynastiesApi: DynastiesService = {
  ...unifiedService,
  getDynasties: () => unifiedService.getAll(),
};
