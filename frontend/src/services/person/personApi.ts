import axios from 'axios';
import type { PersonService } from './personService';
import type { Person } from './types';

const api = axios.create({
  baseURL: '/api/v1',
});

export const personApi: PersonService = {
  getPersons: async () => {
    const response = await api.get<Person[]>('/persons');
    return { data: response.data };
  },
  getPerson: async (id: string) => {
    const response = await api.get<Person>(`/persons/${id}`);
    return { data: response.data };
  },
};
