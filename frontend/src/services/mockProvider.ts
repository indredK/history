import { getPersons as mockGetPersons, getPerson as mockGetPerson } from '../../mock-data/persons.mock';
import { getEvents as mockGetEvents, getEventsByRange as mockGetEventsByRange } from '../../mock-data/events.mock';
import { getPlaces as mockGetPlaces } from '../../mock-data/places.mock';

export const MockProvider = {
  getPersons: () => mockGetPersons(),
  getPerson: (id: string) => mockGetPerson(id),
  getEvents: (page?: number, pageSize?: number, query?: string) =>
    mockGetEvents().then((res) => {
      const items = res.data.filter((e) =>
        query ? (e.title + (e.description ?? '')).includes(query) : true
      );
      if (page && pageSize) {
        const start = (page - 1) * pageSize;
        return {
          data: {
            items: items.slice(start, start + pageSize),
            total: items.length,
            page,
            pageSize,
          },
        };
      }
      return { data: items };
    }),
  getEventsByRange: (startYear: number, endYear: number, page?: number, pageSize?: number, query?: string) =>
    mockGetEventsByRange(startYear, endYear).then((res) => {
      const items = res.data.filter((e) =>
        query ? (e.title + (e.description ?? '')).includes(query) : true
      );
      if (page && pageSize) {
        const start = (page - 1) * pageSize;
        return {
          data: {
            items: items.slice(start, start + pageSize),
            total: items.length,
            page,
            pageSize,
          },
        };
      }
      return { data: items };
    }),
  getPlaces: () => mockGetPlaces(),
};
