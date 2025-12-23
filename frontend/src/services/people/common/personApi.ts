import type { PersonService } from './personService';
import type { CommonPerson } from './types';
import { createApiClient, handleApiResponse, handleSingleApiResponse } from '../../utils/apiResponseHandler';

const api = createApiClient();

export const personApi: PersonService = {
  getPersons: async () => {
    const response = await api.get('/persons');
    return handleApiResponse<CommonPerson>(response);
  },
  getPerson: async (id: string) => {
    const response = await api.get(`/persons/${id}`);
    return handleSingleApiResponse<CommonPerson>(response);
  },
};