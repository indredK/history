import { getDataSource } from '../config/env';
import * as api from '../api';
import { MockProvider } from './mockProvider';

const provider = getDataSource() === 'mock'
  ? MockProvider
  : {
      getPersons: () => api.getPersons(),
      getPerson: (id: string) => api.getPerson(id),
      getEvents: () => api.getEvents(),
      getEventsByRange: (startYear: number, endYear: number) =>
        api.getEventsByRange(startYear, endYear),
      getPlaces: () => api.getPlaces(),
      getDynasties: () => api.getDynasties(),
    };

export const getPersons = provider.getPersons;
export const getPerson = provider.getPerson;
export const getEvents = provider.getEvents;
export const getEventsByRange = provider.getEventsByRange;
export const getPlaces = provider.getPlaces;
export const getDynasties = provider.getDynasties;
