import type { Event } from '@/services/timeline/types';
import type { Place } from '@/services/map/types';
import type { CommonPerson } from '@/services/people/common/types';
import type { Dynasty } from '@/services/culture/types';
import { timelineMock } from '@/services/timeline/timelineMock';
import { mapMock } from '@/services/map/mapMock';
import { personMock } from '@/services/people/common/personMock';
import { dynastiesMock } from '@/services/culture/cultureMock';

export interface MockService {
  // Timeline API
  getEvents(): Promise<{ data: Event[] }>;
  
  // Map API
  getPlaces(): Promise<{ data: Place[] }>;
  
  // Person API
  getPersons(): Promise<{ data: CommonPerson[] }>;
  getPerson(_id: string): Promise<{ data: CommonPerson }>;
  
  // Culture API
  getDynasties(): Promise<{ data: Dynasty[] }>;
}

export const mockService: MockService = {
  // Timeline API (data from /data/json/events.json)
  getEvents: () => timelineMock.getEvents(),
  
  // Map API (data from /data/json/places.json)
  getPlaces: () => mapMock.getPlaces(),
  
  // Person API (data from /data/json/persons.json)
  getPersons: () => personMock.getPersons(),
  getPerson: (_id) => personMock.getPerson(_id),
  
  // Culture API (data from embedded dynasty data)
  getDynasties: () => dynastiesMock.getDynasties(),
};
