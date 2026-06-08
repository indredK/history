import type {
  CommonPerson,
  CreateCommonPersonInput,
  UpdateCommonPersonInput,
} from './types';
import type { BaseService } from '../../base/types';

export interface PersonService extends BaseService<CommonPerson> {
  getPersons(): Promise<{ data: CommonPerson[] }>;
  getPerson(id: string): Promise<{ data: CommonPerson | null }>;
  createPerson(input: CreateCommonPersonInput): Promise<{ data: CommonPerson }>;
  updatePerson(id: string, input: UpdateCommonPersonInput): Promise<{ data: CommonPerson }>;
  deletePerson(id: string): Promise<{ data: CommonPerson }>;
}
