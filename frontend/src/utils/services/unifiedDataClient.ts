/**
 * 统一数据客户端兼容层
 * 为了保持向后兼容性而创建
 */

import { createSimpleDataClient } from './serviceFactory';

/**
 * 服务配置
 */
export const SERVICE_CONFIGS = {
  tangFigure: {
    serviceName: '唐朝人物',
    asyncFunctions: ['getTangFigures', 'getTangFigureById'],
    syncFunctions: ['getRoleTypes', 'getFactions']
  },
  sanguoFigure: {
    serviceName: '三国人物',
    asyncFunctions: ['getSanguoFigures', 'getSanguoFigureById'],
    syncFunctions: ['getRoleTypes', 'getKingdoms']
  },
  songFigure: {
    serviceName: '宋朝人物',
    asyncFunctions: ['getSongFigures', 'getSongFigureById'],
    syncFunctions: ['getRoleTypes', 'getFactions']
  },
  mingFigure: {
    serviceName: '明朝人物',
    asyncFunctions: ['getMingFigures', 'getMingFigureById'],
    syncFunctions: ['getRoleTypes', 'getFactions']
  },
  yuanFigure: {
    serviceName: '元朝人物',
    asyncFunctions: ['getYuanFigures', 'getYuanFigureById'],
    syncFunctions: ['getRoleTypes', 'getFactions']
  },
  qingRuler: {
    serviceName: '清朝统治者',
    asyncFunctions: ['getQingRulers', 'getQingRulerById'],
    syncFunctions: []
  },
  emperor: {
    serviceName: '皇帝',
    asyncFunctions: ['getEmperors', 'getEmperorById'],
    syncFunctions: ['getDynasties']
  },
  scholar: {
    serviceName: '学者',
    asyncFunctions: ['getScholars', 'getScholarById'],
    syncFunctions: []
  },
  schools: {
    serviceName: '思想流派',
    asyncFunctions: ['getSchools', 'getSchoolById'],
    syncFunctions: []
  }
};

/**
 * 创建服务数据客户端
 */
export function createServiceDataClient<T extends Record<string, any>>(
  _serviceName: keyof typeof SERVICE_CONFIGS,
  apiService: T,
  mockService: T
): T {
  return createSimpleDataClient(apiService, mockService);
}