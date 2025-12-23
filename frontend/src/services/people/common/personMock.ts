import type { PersonService } from './personService';
import type { CommonPerson } from './types';
import { loadJsonArray } from '@/utils/services/dataLoaders';

// 转换 JSON 数据为 CommonPerson 格式
function transformJsonToPerson(jsonPerson: any, index: number): CommonPerson {
  const roles = jsonPerson.roles ? jsonPerson.roles.split(',').map((r: string) => r.trim()) : [];
  
  return {
    id: `person_${jsonPerson.name.replace(/\s+/g, '_')}_${index}`,
    name: jsonPerson.name,
    name_en: jsonPerson.name_en,
    birthYear: jsonPerson.birth_year,
    birthMonth: jsonPerson.birth_month,
    deathYear: jsonPerson.death_year,
    deathMonth: jsonPerson.death_month,
    biography: jsonPerson.biography,
    roles: roles,
    source_ids: jsonPerson.source ? [`src_${jsonPerson.source}`] : [],
  };
}

// 缓存加载的数据
let cachedPersons: CommonPerson[] | null = null;

// 延迟1秒获取数据
async function delay() {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

export const personMock: PersonService = {
  getPersons: async () => {
    await delay();
    
    if (cachedPersons) {
      return { data: cachedPersons };
    }

    const jsonPersons = await loadJsonArray<any>('/data/json/persons.json');
    cachedPersons = jsonPersons.map(transformJsonToPerson);
    return { data: cachedPersons };
  },
  getPerson: async (id: string) => {
    await delay();
    
    if (!cachedPersons) {
      const jsonPersons = await loadJsonArray<any>('/data/json/persons.json');
      cachedPersons = jsonPersons.map(transformJsonToPerson);
    }
    
    const person = cachedPersons.find(p => p.id === id);
    
    if (!person) {
      const err = new Error('Person not found');
      // @ts-expect-error decorate
      err.status = 404;
      throw err;
    }
    
    return { data: person };
  },
};