import type { Event } from '../src/types/models';
import { getMockErrorRate } from '../src/config/env';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay() {
  return delay(200 + Math.floor(Math.random() * 300));
}

function maybeError(): void {
  const rate = getMockErrorRate();
  if (rate > 0 && Math.random() < rate) {
    const statuses = [400, 404, 500, 503];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const err = new Error(`Mock error ${status}`);
    // @ts-expect-error decorate
    err.status = status;
    throw err;
  }
}

export const EVENTS: Event[] = [
  {
    id: 'evt_安史之乱',
    title: '安史之乱',
    startYear: 755,
    endYear: 763,
    startDate: '0755-12-16',
    endDate: '0763-02-17',
    description: '唐玄宗统治后期，安禄山和史思明发动的大规模叛乱...',
    eventType: 'war',
    imageUrls: ['https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/An_Lushan_Rebellion_Map.png/640px-An_Lushan_Rebellion_Map.png'],
    categories: [['政治', '战争']],
    sources: [{ id: 'src_史记' }, { id: 'src_wikipedia', title: 'An Lushan Rebellion', url: 'https://zh.wikipedia.org/wiki/安史之乱' }],
  },
  {
    id: 'evt_秦始皇统一六国',
    title: '秦始皇统一六国',
    startYear: -221,
    endYear: -221,
    startDate: '0221-10-01',
    description: '秦灭六国，建立中央集权的秦帝国',
    eventType: 'reform',
    imageUrls: ['https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Qin_Dynasty_unification.png/640px-Qin_Dynasty_unification.png'],
    categories: [['政治', '改革']],
    sources: [{ id: 'src_史记' }, { id: 'src_wikipedia', title: 'Qin unification', url: 'https://zh.wikipedia.org/wiki/秦统一六国' }],
  },
  {
    id: 'evt_玄武门之变',
    title: '玄武门之变',
    startYear: 626,
    endYear: 626,
    startDate: '0626-07-02',
    description: '唐太宗李世民在玄武门击败兄弟，夺取皇位',
    eventType: 'politics',
    categories: [['政治', '政变']],
    sources: [{ id: 'src_通鉴' }],
  },
  {
    id: 'evt_太平天国运动',
    title: '太平天国运动',
    startYear: 1851,
    endYear: 1864,
    startDate: '1851-01-11',
    description: '洪秀全领导的规模巨大的农民战争',
    eventType: 'war',
    categories: [['政治', '战争']],
    sources: [{ id: 'src_近代史' }],
  },
  {
    id: 'evt_辛亥革命',
    title: '辛亥革命',
    startYear: 1911,
    endYear: 1912,
    startDate: '1911-10-10',
    description: '推翻清朝，建立中华民国',
    eventType: 'reform',
    categories: [['政治', '革命']],
    sources: [{ id: 'src_近代史' }, { id: 'src_wikipedia', title: 'Xinhai Revolution', url: 'https://zh.wikipedia.org/wiki/辛亥革命' }],
  },
] satisfies Event[];

const EXTRA: Event[] = Array.from({ length: 55 }).map((_, i) => {
  const year = -2000 + i * 70;
  const y = Math.max(year, -500);
  return {
    id: `evt_mock_${i}`,
    title: `历史编年事件 ${i + 1}`,
    startYear: y,
    endYear: y,
    startDate: `${String(Math.abs(y)).padStart(4, '0')}-01-01`,
    description: '示例事件，用于演示时间轴与筛选、搜索、懒加载等功能。',
    eventType: i % 3 === 0 ? 'culture' : i % 3 === 1 ? 'science' : 'politics',
    categories: [
      [i % 3 === 0 ? '文化' : i % 3 === 1 ? '科技' : '政治', i % 2 === 0 ? '制度' : '人物'],
    ],
    sources: [{ id: 'src_wikipedia' }],
  } as Event;
});

export const ALL_EVENTS: Event[] = [...EVENTS, ...EXTRA];

export async function getEvents() {
  await randomDelay();
  maybeError();
  try {
    const { EventSchema } = await import('../src/types/schemas');
    EventSchema.array().parse(ALL_EVENTS);
  } catch {
    // ignore validation errors in mock mode
  }
  return { data: ALL_EVENTS.slice() };
}

export async function getEventsByRange(startYear: number, endYear: number) {
  await randomDelay();
  maybeError();
  const filtered = ALL_EVENTS.filter(
    (e) => e.startYear <= endYear && (e.endYear ?? e.startYear) >= startYear
  );
  try {
    const { EventSchema } = await import('../src/types/schemas');
    EventSchema.array().parse(filtered);
  } catch {
    // ignore validation errors in mock mode
  }
  return { data: filtered };
}
