import type { PersonService } from './personService';
import { createUnifiedService } from '../../base/serviceFactory';
import type { CommonPerson } from './types';

// 数据转换器
function transformJsonToPerson(jsonPerson: any, index: number): CommonPerson {
  const rolesStr = jsonPerson.roles || jsonPerson.role || '';
  const roles = Array.isArray(rolesStr) ? rolesStr : (rolesStr ? rolesStr.split(',').map((r: string) => r.trim()) : []);
  
  return {
    id: jsonPerson.id || `person_${jsonPerson.name?.replace(/\s+/g, '_') || index}_${index}`,
    name: jsonPerson.name,
    name_en: jsonPerson.name_en || jsonPerson.nameEn,
    birthYear: jsonPerson.birthYear ?? jsonPerson.birth_year,
    birthMonth: jsonPerson.birthMonth ?? jsonPerson.birth_month,
    deathYear: jsonPerson.deathYear ?? jsonPerson.death_year,
    deathMonth: jsonPerson.deathMonth ?? jsonPerson.death_month,
    biography: jsonPerson.biography,
    roles: roles,
    source_ids: jsonPerson.source_ids || (jsonPerson.source ? [`src_${jsonPerson.source}`] : []),
  };
}

// 创建统一服务
const unifiedService = createUnifiedService<CommonPerson>(
  '/persons',
  '/data/json/persons.json',
  transformJsonToPerson,
  { hasGetById: true }
);

export const personApi: PersonService = {
  ...unifiedService,
  getPersons: () => unifiedService.getAll(),
  getPerson: (id: string) => unifiedService.getById!(id),
};