import { describe, expect, it } from 'vitest';
import {
  buildDynastyFocusRange,
  formatTimelineRange,
  formatTimelineYear,
} from './dynastyUtils';

describe('timeline/dynastyUtils', () => {
  it('buildDynastyFocusRange 为朝代补上下文缓冲区间', () => {
    expect(
      buildDynastyFocusRange({
        id: 'tang',
        name: '唐',
        startYear: 618,
        endYear: 907,
      }),
    ).toEqual([578, 947]);
  });

  it('buildDynastyFocusRange 在无结束年份时回退到单点区间', () => {
    expect(
      buildDynastyFocusRange({
        id: 'qin',
        name: '秦',
        startYear: -221,
      }),
    ).toEqual([-261, -181]);
  });

  it('formatTimelineYear 支持长短两种格式', () => {
    expect(formatTimelineYear(-221)).toBe('公元前221年');
    expect(formatTimelineYear(618, { short: true })).toBe('618');
  });

  it('formatTimelineRange 输出完整区间文案', () => {
    expect(formatTimelineRange([-221, 220])).toBe('公元前221年 - 公元220年');
  });
});
