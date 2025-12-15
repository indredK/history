import type { PersonService } from './personService';
import type { Person } from './types';
import { loadJsonData } from '../utils/dataLoader';

// 转换 JSON 数据为 Person 格式
function transformJsonToPerson(jsonPerson: any, index: number): Person {
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
    source_ids: jsonPerson.source ? [`src_${jsonPerson.source}`] : undefined,
  };
}

// 缓存加载的数据
let cachedPersons: Person[] | null = null;

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

    const jsonPersons = await loadJsonData<any>('/data/json/persons.json');
    cachedPersons = jsonPersons.map(transformJsonToPerson);
    return { data: cachedPersons };
  },
  getPerson: async (id: string) => {
    await delay();
    
    if (!cachedPersons) {
      const jsonPersons = await loadJsonData<any>('/data/json/persons.json');
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
