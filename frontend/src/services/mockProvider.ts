import { getPersons as mockGetPersons, getPerson as mockGetPerson } from '../../mock-data/persons.mock';
import { getEvents as mockGetEvents, getEventsByRange as mockGetEventsByRange } from '../../mock-data/events.mock';
import { getPlaces as mockGetPlaces } from '../../mock-data/places.mock';
import { getDynasties as mockGetDynasties } from '../../mock-data/dynasties.mock';

export const MockProvider = {
  getPersons: () => mockGetPersons(),
  getPerson: (id: string) => mockGetPerson(id),
  getEvents: () => mockGetEvents(),
  getEventsByRange: (startYear: number, endYear: number) => mockGetEventsByRange(startYear, endYear),
  getPlaces: () => mockGetPlaces(),
  getDynasties: () => mockGetDynasties(),
};
