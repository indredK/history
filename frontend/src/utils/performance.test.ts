/**
 * performance.ts 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - PerformanceMonitor.getInstance:返回单例
 * - mark:把 `${name}-start` 写入内部 metrics 映射,且时间戳来自 performance.now()
 * - measure:存在对应 mark 时返回 duration,并在 metrics 写入新条目
 * - measure:不存在对应 mark 时返回 0 并 console.warn(走兜底分支)
 * - getMetrics:返回 metrics 的快照对象
 * - reportWebVitals:'web-vital' in window 时 console.log;否则不报错
 *
 * 注意:
 * - PerformanceMonitor 是单例,各用例间会复用 metrics Map;
 *   每次用例采用唯一 name 避免互相干扰。
 * - performance.now / performance.mark / performance.measure 在 jsdom 下
 *   原生可用,但我们用 spy 控制 now() 的返回值以验证 duration 计算。
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PerformanceMonitor } from './performance';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = PerformanceMonitor.getInstance();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getInstance 返回同一个单例', () => {
    const a = PerformanceMonitor.getInstance();
    const b = PerformanceMonitor.getInstance();
    expect(a).toBe(b);
  });

  it('mark 把 ${name}-start 写入 metrics,值来自 performance.now()', () => {
    const nowSpy = vi.spyOn(performance, 'now').mockReturnValue(123.456);
    monitor.mark('perf-mark-test-1');

    const all = monitor.getMetrics();
    expect(all['perf-mark-test-1-start']).toBe(123.456);
    expect(nowSpy).toHaveBeenCalled();
  });

  it('mark 同时调用 performance.mark API', () => {
    const markSpy = vi.spyOn(performance, 'mark');
    monitor.mark('perf-mark-test-2');
    expect(markSpy).toHaveBeenCalledWith('perf-mark-test-2-start');
  });

  it('measure 在 mark 存在时返回 duration 并存入 metrics', () => {
    const nowSpy = vi
      .spyOn(performance, 'now')
      .mockReturnValueOnce(1000) // mark
      .mockReturnValueOnce(1250); // measure

    monitor.mark('perf-measure-test-1');
    const d = monitor.measure('perf-measure-test-1');

    expect(d).toBe(250);
    expect(monitor.getMetrics()['perf-measure-test-1']).toBe(250);
    expect(nowSpy).toHaveBeenCalledTimes(2);
  });

  it('measure 在 mark 缺失时返回 0 并 console.warn', () => {
    const result = monitor.measure('never-marked-xyz');
    expect(result).toBe(0);
     
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('never-marked-xyz-start not found'),
    );
  });

  it('measure 调用底层 performance.mark / measure API', () => {
    const markSpy = vi.spyOn(performance, 'mark');
    const measureSpy = vi.spyOn(performance, 'measure');
    vi.spyOn(performance, 'now')
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(110);

    monitor.mark('perf-measure-api');
    monitor.measure('perf-measure-api');

    expect(markSpy).toHaveBeenCalledWith('perf-measure-api-start');
    expect(markSpy).toHaveBeenCalledWith('perf-measure-api-end');
    expect(measureSpy).toHaveBeenCalledWith(
      'perf-measure-api',
      'perf-measure-api-start',
      'perf-measure-api-end',
    );
  });

  it('已知行为:start time = 0 会被 `if (!startTime)` 误判为"没标记过"', () => {
    // 源码用 `if (!startTime)` 检查 mark 是否存在,0 是 falsy
    // 所以理论上若 performance.now() 在 mark 时刚好返回 0,measure 会
    // 直接走兜底分支(返回 0 + console.warn)。此处显式锁定行为,
    // 提醒后续若改成 `startTime === undefined` 会改变这条用例结果。
    vi.spyOn(performance, 'now').mockReturnValue(0);
    monitor.mark('perf-zero-start');
    const d = monitor.measure('perf-zero-start');
    expect(d).toBe(0);
     
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('perf-zero-start-start not found'),
    );
  });

  it('getMetrics 返回的是普通对象,可用 in 检查 key', () => {
    vi.spyOn(performance, 'now').mockReturnValue(7);
    monitor.mark('perf-snapshot-test');
    const snap = monitor.getMetrics();
    expect(typeof snap).toBe('object');
    expect('perf-snapshot-test-start' in snap).toBe(true);
  });

  it('reportWebVitals 在 window 上无 web-vital 时不报错', () => {
    // jsdom 默认 window 上没有 'web-vital',分支会被跳过
    expect(() => monitor.reportWebVitals()).not.toThrow();
    expect(console.log).not.toHaveBeenCalled();
  });

  it('reportWebVitals 在 window 上有 web-vital 时 console.log 提示', () => {
    // @ts-expect-error 手动注入 'web-vital' 键以走入分支
    window['web-vital'] = true;
    try {
      monitor.reportWebVitals();
       
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Web Vitals'),
      );
    } finally {
      // @ts-expect-error 清理键避免污染后续用例
      delete window['web-vital'];
    }
  });
});
