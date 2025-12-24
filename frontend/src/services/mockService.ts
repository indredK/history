import type { ServiceInterface } from './apiService';
import { timelineMock } from '@/services/timeline/timelineMock';
import { mapMock } from '@/services/map/mapMock';
import { personMock } from '@/services/people/common/personMock';
import { dynastiesMock } from '@/services/culture/cultureMock';
import { emperorMock } from '@/services/emperor/emperorMock';
import { fetchMythologies, fetchMythologyById } from '@/services/mythology/mythologyApi';
import { getReligionGraphData, getReligionNodeById } from '@/services/religion/religionApi';
import { schoolsMock } from '@/services/schools/schoolsMock';

export const mockService: ServiceInterface = {
  getEvents: () => timelineMock.getEvents(),
  getPlaces: () => mapMock.getPlaces(),
  getPersons: () => personMock.getPersons(),
  getPerson: (id) => personMock.getPerson(id),
  getDynasties: () => dynastiesMock.getDynasties(),
  getEmperors: () => emperorMock.getEmperors(),
  getEmperor: (id) => emperorMock.getEmperor(id),
  getMythologies: async () => {
    const result = await fetchMythologies();
    return { data: result.data };
  },
  getMythology: async (id) => {
    const result = await fetchMythologyById(id);
    return { data: result };
  },
  getReligionGraph: async () => {
    const result = await getReligionGraphData();
    return { data: result.data };
  },
  getReligionNode: async (id) => {
    const result = await getReligionNodeById(id);
    return { data: result.data };
  },
  getSchools: () => schoolsMock.getSchools(),
  getSchool: (id) => schoolsMock.getSchool(id),
};
