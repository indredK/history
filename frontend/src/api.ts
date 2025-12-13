import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
});

export const getPersons = () => api.get('/persons');
export const getPerson = (id: string) => api.get(`/persons/${id}`);
export const getEvents = () => api.get('/events');
export const getEventsByRange = (startYear: number, endYear: number) =>
  api.get('/timeline', { params: { startYear, endYear } });
export const getPlaces = () => api.get('/places');

export default api;
