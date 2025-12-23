import type { CommonPerson } from './types';

export interface PersonService {
  getPersons(): Promise<{ data: CommonPerson[] }>;
  getPerson(_id: string): Promise<{ data: CommonPerson }>;
}