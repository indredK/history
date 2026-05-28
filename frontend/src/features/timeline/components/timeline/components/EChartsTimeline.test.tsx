import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Dynasty } from '@/services/culture/types';
import type { Event } from '@/services/timeline/types';
import { useThemeStore } from '@/store';
import { EChartsTimeline } from './EChartsTimeline';

type EChartsInitResult = {
  setOption: ReturnType<typeof vi.fn>;
  getOption: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  resize: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
};

const chartInstances: EChartsInitResult[] = [];

vi.mock('echarts/core', () => {
  return {
    use: vi.fn(),
    init: vi.fn(() => {
      const instance: EChartsInitResult = {
        setOption: vi.fn(),
        getOption: vi.fn(() => ({
          dataZoom: [{ id: 'timeline-slider-range', startValue: 600, endValue: 900 }],
        })),
        on: vi.fn(),
        off: vi.fn(),
        resize: vi.fn(),
        dispose: vi.fn(),
      };
      chartInstances.push(instance);
      return instance;
    }),
  };
});

vi.mock('echarts/charts', () => ({
  CustomChart: {},
  ScatterChart: {},
}));

vi.mock('echarts/components', () => ({
  DataZoomComponent: {},
  GridComponent: {},
  TooltipComponent: {},
}));

vi.mock('echarts/renderers', () => ({
  CanvasRenderer: {},
}));

function makeDynasty(overrides: Partial<Dynasty> = {}): Dynasty {
  return {
    id: overrides.id ?? 'tang',
    name: overrides.name ?? '唐',
    startYear: overrides.startYear ?? 618,
    endYear: overrides.endYear ?? 907,
    ...overrides,
  };
}

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: overrides.id ?? 'event',
    title: overrides.title ?? '事件',
    startYear: overrides.startYear ?? 700,
    eventType: overrides.eventType ?? 'political_event',
    dynastyId: overrides.dynastyId ?? 'tang',
    ...(overrides.endYear !== undefined ? { endYear: overrides.endYear } : {}),
    ...(overrides.description !== undefined ? { description: overrides.description } : {}),
    ...overrides,
  };
}

function latestOption() {
  const chart = chartInstances[chartInstances.length - 1];
  expect(chart).toBeDefined();
  const calls = chart?.setOption.mock.calls ?? [];
  const lastCall = calls[calls.length - 1];
  expect(lastCall).toBeDefined();
  return lastCall?.[0] as {
    series: Array<{ id?: string; data?: Array<{ value: [number, number] }> }>;
  };
}

describe('EChartsTimeline', () => {
  beforeEach(() => {
    chartInstances.length = 0;
    useThemeStore.setState({ theme: 'light' });
    vi.stubGlobal(
      'requestAnimationFrame',
      ((cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      }) as typeof requestAnimationFrame,
    );
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserver {
        observe() {}
        disconnect() {}
      },
    );
  });

  it('renders cluster series when clusterData is provided', () => {
    render(
      <EChartsTimeline
        eventsData={[
          makeEvent({ id: 'a', startYear: 640 }),
          makeEvent({ id: 'b', startYear: 640 }),
          makeEvent({ id: 'c', startYear: 641 }),
        ]}
        dynastiesData={[makeDynasty()]}
        timeRange={[618, 907]}
        clusterData={{
          yearClusters: [
            {
              id: 'year:640:政治',
              year: 640,
              category: '政治',
              events: [makeEvent({ id: 'a', startYear: 640 }), makeEvent({ id: 'b', startYear: 640 })],
              dynastyIds: ['tang'],
            },
          ],
          dynastyClusters: [
            {
              id: 'dynasty:tang:政治:0',
              dynastyId: 'tang',
              category: '政治',
              startYear: 618,
              endYear: 657,
              events: [
                makeEvent({ id: 'a', startYear: 640 }),
                makeEvent({ id: 'b', startYear: 642 }),
                makeEvent({ id: 'c', startYear: 645 }),
              ],
            },
          ],
          densityMode: 'all',
        }}
      />,
    );

    const option = latestOption();
    const seriesIds = option.series.map((series) => series.id);
    expect(seriesIds).toContain('year-clusters');
    expect(seriesIds).toContain('dynasty-clusters');
  });

  it('places diplomatic clusters in the diplomatic lane instead of falling back', () => {
    render(
      <EChartsTimeline
        eventsData={[
          makeEvent({ id: 'war', startYear: 630, eventType: 'war' }),
          makeEvent({ id: 'dip', startYear: 640, eventType: 'diplomatic_event' }),
        ]}
        dynastiesData={[makeDynasty()]}
        timeRange={[618, 907]}
        clusterData={{
          yearClusters: [
            {
              id: 'year:640:外交',
              year: 640,
              category: '外交',
              events: [makeEvent({ id: 'dip-a', startYear: 640, eventType: 'diplomatic_event' })],
              dynastyIds: ['tang'],
            },
          ],
          dynastyClusters: [],
          densityMode: 'all',
        }}
      />,
    );

    const option = latestOption();
    const yearSeries = option.series.find((series) => series.id === 'year-clusters');
    const value = yearSeries?.data?.[0]?.value;
    expect(value).toBeDefined();
    expect(value?.[1]).toBeCloseTo(0.525, 4);
  });

  it('rebuilds chart option when event point visibility changes', () => {
    const events = [makeEvent({ id: 'single', startYear: 700 })];
    const dynasties = [makeDynasty()];

    const { rerender } = render(
      <EChartsTimeline
        eventsData={events}
        dynastiesData={dynasties}
        timeRange={[618, 907]}
        showEventPoints
      />,
    );

    const chart = chartInstances[chartInstances.length - 1];
    expect(chart).toBeDefined();
    const initialCallCount = chart?.setOption.mock.calls.length ?? 0;

    rerender(
      <EChartsTimeline
        eventsData={events}
        dynastiesData={dynasties}
        timeRange={[618, 907]}
        showEventPoints={false}
      />,
    );

    expect(chart?.setOption.mock.calls.length).toBe(initialCallCount + 1);
    const option = latestOption();
    const eventSeries = option.series.find((series) => series.id === 'events');
    expect(eventSeries?.data).toEqual([]);
  });
});
