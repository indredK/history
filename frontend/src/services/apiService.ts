import type { Event } from '@/services/timeline/types';
import type { Place } from '@/services/map/types';
import type { CommonPerson } from '@/services/person/common/types';
import type { Dynasty } from '@/services/culture/types';
import type { Emperor } from '@/services/person/emperors/types';
import type { Mythology } from '@/services/mythology/types';
import type { ReligionGraphData } from '@/services/religion/types';
import type { PhilosophicalSchool } from '@/services/school/types';
import { timelineApi } from '@/services/timeline/timelineApi';
import { mapApi } from '@/services/map/mapApi';
import { personApi } from '@/services/person/common/personApi';
import { dynastiesApi } from '@/services/culture/cultureApi';
import { getEmperors, getEmperorById } from '@/services/person/emperors/emperorApi';
import { mythologyApi } from '@/services/mythology/mythologyApi';
import { getReligionGraphData, getReligionNodeById } from '@/services/religion/religionApi';
import { getSchools, getSchoolById } from '@/services/school/schoolApi';

export interface ServiceInterface {
  getEvents(): Promise<{ data: Event[] }>;
  getPlaces(): Promise<{ data: Place[] }>;
  getPersons(): Promise<{ data: CommonPerson[] }>;
  getPerson(id: string): Promise<{ data: CommonPerson | null }>;
  getDynasties(): Promise<{ data: Dynasty[] }>;
  getEmperors(): Promise<{ data: Emperor[] }>;
  getEmperor(id: string): Promise<{ data: Emperor | null }>;
  getMythologies(): Promise<{ data: Mythology[] }>;
  getMythology(id: string): Promise<{ data: Mythology | null }>;
  getReligionGraph(): Promise<{ data: ReligionGraphData }>;
  getReligionNode(id: string): Promise<{ data: ReligionGraphData['nodes'][0] | null }>;
  getSchools(): Promise<{ data: PhilosophicalSchool[] }>;
  getSchool(id: string): Promise<{ data: PhilosophicalSchool | null }>;
}

export const apiService: ServiceInterface = {
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
