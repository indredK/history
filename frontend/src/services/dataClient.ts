/**
 * 数据客户端 - 统一的数据获取入口
 * 提供跨服务的数据获取函数
 */

import { dynastiesApi } from './culture/cultureApi';
import { timelineApi } from './timeline/timelineApi';
import { mapApi } from './map/mapApi';
import type { Dynasty } from './culture/types';
import type { Event } from './timeline/types';
import type { Place } from './map/types';

export function getDynasties(): Promise<{ data: Dynasty[] }> {
  return dynastiesApi.getDynasties();
}

export function getEvents(): Promise<{ data: Event[] }> {
  return timelineApi.getEvents();
}

export function getPlaces(): Promise<{ data: Place[] }> {
  return mapApi.getPlaces();
}
