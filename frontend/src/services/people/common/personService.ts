import type { CommonPerson } from './types';
import type { BaseService } from '../../base/types';

export interface PersonService extends BaseService<CommonPerson> {
  getPersons(): Promise<{ data: CommonPerson[] }>;
  getPerson(id: string): Promise<{ data: CommonPerson | null }>;
}