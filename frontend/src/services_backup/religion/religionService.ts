import type { ReligionGraphData } from './types';
import type { BaseService } from '../base/types';

export interface ReligionService extends BaseService<ReligionGraphData> {
  getReligionGraph(): Promise<{ data: ReligionGraphData }>;
  getReligionNode(id: string): Promise<{ data: ReligionGraphData['nodes'][0] | null }>;
}