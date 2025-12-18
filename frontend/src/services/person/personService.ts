import type { Person } from './types';

export interface PersonService {
  getPersons(): Promise<{ data: Person[] }>;
  getPerson(_id: string): Promise<{ data: Person }>;
}
