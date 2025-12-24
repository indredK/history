export type { ServiceInterface } from './apiService';
export { apiService } from './apiService';
export { mockService } from './mockService';
export { getService, dataClient } from './dataClient';

// 基础服务架构
export * from './base';

// 类型定义
export type { Event } from './timeline/types';
export type { Place } from './map/types';
export type { CommonPerson } from './person/common/types';
export type { Dynasty } from './culture/types';
export type { Emperor } from './person/emperors/types';
export type { Mythology } from './mythology/types';
export type { ReligionGraphData, ReligionNode, ReligionEdge } from './religion/types';
export type { PhilosophicalSchool } from './school/types';