import type { MythologyService } from './mythologyService';
import { createUnifiedService } from '../base/serviceFactory';
import type { Mythology } from './types';

// 数据转换器
function transformJsonToMythology(jsonMythology: any): Mythology {
  return {
    id: jsonMythology.id,
    title: jsonMythology.title,
    englishTitle: jsonMythology.englishTitle,
    category: jsonMythology.category,
    description: jsonMythology.description,
    characters: jsonMythology.characters || [],
    source: jsonMythology.source,
    imageUrl: jsonMythology.imageUrl,
  };
}

// 创建统一服务
const unifiedService = createUnifiedService<Mythology>(
  '/mythologies',
  '/data/json/mythologies.json',
  transformJsonToMythology,
  { hasGetById: true }
);

export const mythologyApi: MythologyService = {
  ...unifiedService,
  getMythologies: () => unifiedService.getAll(),
  getMythology: (id: string) => unifiedService.getById!(id),
};

// 保持向后兼容的导出
export async function fetchMythologies() {
  const result = await mythologyApi.getMythologies();
  return {
    data: result.data,
    success: true
  };
}

export async function fetchMythologyById(id: string) {
  try {
    const result = await mythologyApi.getMythology(id);
    return result.data;
  } catch (error) {
    return null;
  }
}
