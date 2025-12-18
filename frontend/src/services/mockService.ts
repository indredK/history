import type { Event } from '@/services/timeline/types';
import type { Place } from '@/services/map/types';
import type { Person } from '@/services/person/types';
import type { Dynasty } from '@/services/culture/types';
import { timelineMock } from '@/services/timeline/timelineMock';
import { mapMock } from '@/services/map/mapMock';
import { personMock } from '@/services/person/personMock';
import { cultureMock } from '@/services/culture/cultureMock';

export interface MockService {
  // Timeline API
  getEvents(): Promise<{ data: Event[] }>;
  getEventsByRange(_startYear: number, _endYear: number): Promise<{ data: Event[] }>;
  
  // Map API
  getPlaces(): Promise<{ data: Place[] }>;
  
  // Person API
  getPersons(): Promise<{ data: Person[] }>;
  getPerson(_id: string): Promise<{ data: Person }>;
  
  // Culture API
  getDynasties(): Promise<{ data: Dynasty[] }>;
}

export const mockService: MockService = {
  // Timeline API (data from /data/json/events.json)
  getEvents: () => timelineMock.getEvents(),
  getEventsByRange: (_startYear, _endYear) => timelineMock.getEventsByRange(_startYear, _endYear),
  
  // Map API (data from /data/json/places.json)
  getPlaces: () => mapMock.getPlaces(),
  
  // Person API (data from /data/json/persons.json)
  getPersons: () => personMock.getPersons(),
  getPerson: (_id) => personMock.getPerson(_id),
  
  // Culture API (data from embedded dynasty data)
  getDynasties: () => cultureMock.getDynasties(),
};
