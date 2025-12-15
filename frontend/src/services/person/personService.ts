import type { Person } from './types';

export interface PersonService {
  getPersons(): Promise<{ data: Person[] }>;
  getPerson(id: string): Promise<{ data: Person }>;
}
