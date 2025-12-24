/**
 * 清朝统治者API服务
 * Qing Dynasty Ruler API Service
 * 
 * 使用统一服务工厂创建API和Mock服务
 * 
 * Requirements: 4.7, 4.8
 */

import type { QingRuler } from './types';
import { createUnifiedService } from '@/utils/services/serviceFactory';
import { type QingRulerService, qingRulerServiceHelper } from './qingRulerService';



/**
 * 转换JSON数据为QingRuler类型
 */
const transformJsonToQingRuler = (jsonData: any, index: number): QingRuler => {
  return {
    id: jsonData.id || `qing_ruler_${jsonData.name?.replace(/\s+/g, '_') || `unknown_${index}`}`,
    name: jsonData.name || '',
    templeName: jsonData.templeName || '',
    eraName: jsonData.eraName || '',
    reignStart: jsonData.reignStart || 0,
    reignEnd: jsonData.reignEnd || 0,
    policies: jsonData.policies || [],
    majorEvents: jsonData.majorEvents || [],
    contribution: jsonData.contribution || '',
    responsibility: jsonData.responsibility || '',
    evaluations: jsonData.evaluations || [],
    biography: jsonData.biography || '',
    portraitUrl: jsonData.portraitUrl || '',
    sources: jsonData.sources || []
  };
};

// 创建统一服务
const unifiedService = createUnifiedService<QingRuler>(
  '/qing-rulers',
  '/data/json/qing_figures.json',
  transformJsonToQingRuler,
  { hasGetById: true }
);

// 实现完整的QingRulerService接口
export const qingRulerService: QingRulerService = {
  ...unifiedService,
  getAll: () => unifiedService.getAll(),
  getById: (id: string) => unifiedService.getById!(id),
  filterByPeriod: qingRulerServiceHelper.filterByPeriod,
  searchRulers: qingRulerServiceHelper.searchRulers,
  sortRulers: qingRulerServiceHelper.sortRulers,
  filterAndSort: qingRulerServiceHelper.filterAndSort,
  formatReignPeriod: qingRulerServiceHelper.formatReignPeriod,
  calculateReignYears: qingRulerServiceHelper.calculateReignYears,
  getTitle: qingRulerServiceHelper.getTitle
};

// 导出获取清朝统治者列表的函数
export const getQingRulers = () => qingRulerService.getAll();

// 导出类型
export type { QingRulerService } from './qingRulerService';