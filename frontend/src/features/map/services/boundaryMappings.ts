import type { BoundaryMapping } from '../../../types/map';

export const BOUNDARY_MAPPINGS: Record<string, BoundaryMapping> = {
  qin: {
    file: '/data/raw/boundaries_qin.geojson',
    validFrom: -221,
    validTo: -206,
    name: '秦朝疆域',
    period: '秦朝 (前221-前206)'
  },
  han: {
    file: '/data/raw/boundaries_han.geojson',
    validFrom: -206,
    validTo: 220,
    name: '汉朝疆域',
    period: '汉朝 (前206-220)'
  },
  three_kingdoms: {
    file: '/data/raw/boundaries_three_kingdoms.geojson',
    validFrom: 220,
    validTo: 280,
    name: '三国疆域',
    period: '三国 (220-280)'
  },
  jin: {
    file: '/data/raw/boundaries_jin.geojson',
    validFrom: 265,
    validTo: 420,
    name: '晋朝疆域',
    period: '晋朝 (265-420)'
  },
  sui: {
    file: '/data/raw/boundaries_sui.geojson',
    validFrom: 581,
    validTo: 618,
    name: '隋朝疆域',
    period: '隋朝 (581-618)'
  },
  tang: {
    file: '/data/raw/boundaries_tang.geojson',
    validFrom: 618,
    validTo: 907,
    name: '唐朝疆域',
    period: '唐朝 (618-907)'
  },
  song: {
    file: '/data/raw/boundaries_song.geojson',
    validFrom: 960,
    validTo: 1279,
    name: '宋朝疆域',
    period: '宋朝 (960-1279)'
  },
  yuan: {
    file: '/data/raw/boundaries_yuan.geojson',
    validFrom: 1271,
    validTo: 1368,
    name: '元朝疆域',
    period: '元朝 (1271-1368)'
  },
  ming: {
    file: '/data/raw/boundaries_ming.geojson',
    validFrom: 1368,
    validTo: 1644,
    name: '明朝疆域',
    period: '明朝 (1368-1644)'
  },
  qing: {
    file: '/data/raw/boundaries_qing.geojson',
    validFrom: 1644,
    validTo: 1912,
    name: '清朝疆域',
    period: '清朝 (1644-1912)'
  }
};

// 定义历史时期的关键年份节点
export const DYNASTY_TIMELINE = [
  { year: -221, name: '秦朝', period: '秦 (前221-前206)' },
  { year: -206, name: '汉朝', period: '汉 (前206-220)' },
  { year: 220, name: '三国', period: '三国 (220-280)' },
  { year: 265, name: '晋朝', period: '晋 (265-420)' },
  { year: 420, name: '南北朝', period: '南北朝 (420-589)' },
  { year: 581, name: '隋朝', period: '隋 (581-618)' },
  { year: 618, name: '唐朝', period: '唐 (618-907)' },
  { year: 907, name: '五代十国', period: '五代十国 (907-960)' },
  { year: 960, name: '宋朝', period: '宋 (960-1279)' },
  { year: 1271, name: '元朝', period: '元 (1271-1368)' },
  { year: 1368, name: '明朝', period: '明 (1368-1644)' },
  { year: 1644, name: '清朝', period: '清 (1644-1912)' }
];

export function findBoundaryForYear(year: number): BoundaryMapping | null {
  for (const mapping of Object.values(BOUNDARY_MAPPINGS)) {
    if (year >= mapping.validFrom && year <= mapping.validTo) {
      return mapping;
    }
  }
  return null;
}

export function getAllBoundaryMappings(): BoundaryMapping[] {
  return Object.values(BOUNDARY_MAPPINGS);
}
