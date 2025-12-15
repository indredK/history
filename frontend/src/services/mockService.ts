import type { Event } from './timeline/types';
import type { Place } from './map/types';
import type { Person } from './person/types';
import type { Dynasty } from './culture/types';
import { timelineMock } from './timeline/timelineMock';
import { mapMock } from './map/mapMock';
import { personMock } from './person/personMock';
import { cultureMock } from './culture/cultureMock';

export interface MockService {
  // Timeline API
  getEvents(): Promise<{ data: Event[] }>;
  getEventsByRange(startYear: number, endYear: number): Promise<{ data: Event[] }>;
  
  // Map API
  getPlaces(): Promise<{ data: Place[] }>;
  
  // Person API
  getPersons(): Promise<{ data: Person[] }>;
  getPerson(id: string): Promise<{ data: Person }>;
  
  // Culture API
  getDynasties(): Promise<{ data: Dynasty[] }>;
}

export const mockService: MockService = {
  // Timeline API (data from /data/json/events.json)
  getEvents: () => timelineMock.getEvents(),
  getEventsByRange: (startYear, endYear) => timelineMock.getEventsByRange(startYear, endYear),
  
  // Map API (data from /data/json/places.json)
  getPlaces: () => mapMock.getPlaces(),
  
  // Person API (data from /data/json/persons.json)
  getPersons: () => personMock.getPersons(),
  getPerson: (id) => personMock.getPerson(id),
  
  // Culture API (data from embedded dynasty data)
  getDynasties: () => cultureMock.getDynasties(),
};
