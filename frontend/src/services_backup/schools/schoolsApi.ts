import type { SchoolsService } from './schoolsService';
import { createUnifiedService } from '../base/serviceFactory';
import type { PhilosophicalSchool } from './types';

// 数据转换器
function transformJsonToSchool(jsonSchool: any): PhilosophicalSchool {
  return {
    id: jsonSchool.id,
    name: jsonSchool.name,
    name_en: jsonSchool.name_en,
    founder: jsonSchool.founder,
    founderEn: jsonSchool.founderEn,
    foundingYear: jsonSchool.foundingYear,
    foundingPeriod: jsonSchool.foundingPeriod,
    coreBeliefs: jsonSchool.coreBeliefs,
    keyTexts: jsonSchool.keyTexts,
    representativeFigures: jsonSchool.representativeFigures,
    classicWorks: jsonSchool.classicWorks,
    description: jsonSchool.description,
    influence: jsonSchool.influence,
    color: jsonSchool.color,
  };
}

// 创建统一服务
const unifiedService = createUnifiedService<PhilosophicalSchool>(
  '/schools',
  '/data/json/schools.json',
  transformJsonToSchool,
  { hasGetById: true }
);

// 实现学派服务
export const schoolsApi: SchoolsService = {
  ...unifiedService,
  getSchools: () => unifiedService.getAll(),
  getSchool: (id: string) => unifiedService.getById!(id),
};

// 保持向后兼容的导出
export const getSchools = () => schoolsApi.getSchools();
export const getSchoolById = (id: string) => schoolsApi.getSchool(id);
