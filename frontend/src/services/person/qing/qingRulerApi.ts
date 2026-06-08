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
import {
  isRecord,
  readEvaluations,
  readEvents,
  readNumber,
  readOptionalString,
  readString,
  readStringArray,
} from '../common/figureTransform';

function readPolicies(record: Record<string, unknown>): QingRuler['policies'] {
  const policies = record['policies'];
  if (!Array.isArray(policies)) return [];

  return policies.map((item, index) => {
    const policy = isRecord(item) ? item : {};
    const result: QingRuler['policies'][number] = {
      name: readString(policy, 'name', `政策${index + 1}`),
      description: readString(policy, 'description'),
      impact: readString(policy, 'impact'),
    };
    const year = readNumber(policy, 'year', Number.NaN);
    if (Number.isFinite(year)) result.year = year;
    return result;
  });
}


/**
 * 转换JSON数据为QingRuler类型
 */
const transformJsonToQingRuler = (jsonData: unknown, index: number): QingRuler => {
  const record = isRecord(jsonData) ? jsonData : {};
  const name = readString(record, 'name');
  const figure: QingRuler = {
    id: readString(record, 'id', `qing_ruler_${name.replace(/\s+/g, '_') || `unknown_${index}`}`),
    name,
    templeName: readString(record, 'templeName'),
    eraName: readString(record, 'eraName'),
    reignStart: readNumber(record, 'reignStart'),
    reignEnd: readNumber(record, 'reignEnd'),
    policies: readPolicies(record),
    majorEvents: readEvents({ events: record['majorEvents'] }),
    contribution: readString(record, 'contribution'),
    responsibility: readString(record, 'responsibility'),
    evaluations: readEvaluations(record),
    sources: readStringArray(record, 'sources'),
  };

  const biography = readOptionalString(record, 'biography');
  const portraitUrl = readOptionalString(record, 'portraitUrl');
  if (biography) figure.biography = biography;
  if (portraitUrl) figure.portraitUrl = portraitUrl;
  return figure;
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
