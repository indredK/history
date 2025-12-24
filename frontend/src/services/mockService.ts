import type { ServiceInterface } from './apiService';
import { timelineApi } from '@/services/timeline/timelineApi';
import { mapApi } from '@/services/map/mapApi';
import { personApi } from '@/services/people/common/personApi';
import { dynastiesApi } from '@/services/culture/cultureApi';
import { getEmperors, getEmperorById } from '@/services/people/emperors/emperorApi';
import { mythologyApi } from '@/services/mythology/mythologyApi';
import { getReligionGraphData, getReligionNodeById } from '@/services/religion/religionApi';
import { getSchools, getSchoolById } from '@/services/schools/schoolsApi';

export const mockService: ServiceInterface = {
  getEvents: () => timelineApi.getEvents(),
  getPlaces: () => mapApi.getPlaces(),
  getPersons: () => personApi.getPersons(),
  getPerson: (id) => personApi.getPerson(id),
  getDynasties: () => dynastiesApi.getDynasties(),
  getEmperors: () => getEmperors(),
  getEmperor: (id) => getEmperorById(id),
  getMythologies: async () => {
    const result = await mythologyApi.getMythologies();
    return { data: result.data };
  },
  getMythology: async (id) => {
    const result = await mythologyApi.getMythology(id);
    return { data: result.data };
  },
  getReligionGraph: async () => {
    const result = await getReligionGraphData();
    return { data: result.data };
  },
  getReligionNode: async (id) => {
    const result = await getReligionNodeById(id);
    return { data: result.data };
  },
  getSchools: () => getSchools(),
  getSchool: (id) => getSchoolById(id),
};
