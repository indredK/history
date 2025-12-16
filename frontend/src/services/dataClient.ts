import { getDataSource } from '@/config/env';
import { apiService } from './apiService';
import { mockService } from './mockService';

const provider = getDataSource() === 'mock'
  ? mockService
  : apiService;

export const getPersons = provider.getPersons;
export const getPerson = provider.getPerson;
export const getEvents = provider.getEvents;
export const getEventsByRange = provider.getEventsByRange;
export const getPlaces = provider.getPlaces;
export const getDynasties = provider.getDynasties;
