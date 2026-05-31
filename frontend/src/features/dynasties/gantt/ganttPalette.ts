/**
 * 朝代甘特图 - 配色
 *
 * 没有覆盖全部 63 个政权的现成调色板，因此按行号从稳定色板取色，
 * 保证同一政权颜色恒定。轴 / tooltip 颜色取自 CSS 变量（主题感知）。
 *
 * readCssVar / colorToChannels / colorWithAlpha 三个纯函数复刻自
 * features/timeline/components/timeline/components/EChartsTimeline.tsx（§232-287）。
 */

/** 柔和色板（暖色为主，贴合项目毛玻璃 / 古典风格） */
const PALETTE = [
  '#9b6121',
  '#6b8797',
  '#8a5a44',
  '#7e8a5a',
  '#a8743f',
  '#5f7a86',
  '#b08b4f',
  '#7a6a93',
  '#6f9070',
  '#a35d57',
  '#5d8a8a',
  '#977b3e',
  '#8f6f9c',
  '#c08a5a',
];

function readCssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') {
    return fallback;
  }
  const value = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

function colorToChannels(color: string): [number, number, number] | null {
  const normalized = color.trim();
  const hex = normalized.replace('#', '');

  if (hex.length === 3) {
    const channels = hex
      .split('')
      .map((channel) => Number.parseInt(channel + channel, 16));
    if (channels.length !== 3 || channels.some((c) => Number.isNaN(c))) {
      return null;
    }
    return channels as [number, number, number];
  }

  if (hex.length === 6 && /^#[0-9a-f]{6}$/i.test(normalized)) {
    return [
      Number.parseInt(hex.slice(0, 2), 16),
      Number.parseInt(hex.slice(2, 4), 16),
      Number.parseInt(hex.slice(4, 6), 16),
    ];
  }

  const match = normalized.match(/^rgba?\(([^)]+)\)$/i);
  if (!match || !match[1]) {
    return null;
  }
  const parts = match[1]
    .split(',')
    .slice(0, 3)
    .map((part) => Number.parseFloat(part.trim()));
  if (parts.length !== 3 || parts.some((p) => Number.isNaN(p))) {
    return null;
  }
  return parts as [number, number, number];
}

function colorWithAlpha(color: string, alpha: number): string {
  const channels = colorToChannels(color);
  if (!channels) {
    return color;
  }
  return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${alpha})`;
}

export interface GanttColors {
  axisText: string;
  axisLine: string;
  splitLine: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  label: string;
  /** polity 整条底色带 */
  bandFill: (rowName: string) => string;
  /** ruler / era 小块填充 */
  subFill: (rowName: string, type: 'ruler' | 'era') => string;
  /** ruler / era 小块描边 */
  subStroke: (rowName: string) => string;
}

export function buildGanttColors(
  isLight: boolean,
  categories: string[],
): GanttColors {
  const idxByName = new Map<string, number>();
  categories.forEach((name, i) => idxByName.set(name, i));

  const hueOf = (rowName: string): string => {
    const i = idxByName.get(rowName) ?? 0;
    return PALETTE[i % PALETTE.length] ?? PALETTE[0]!;
  };

  return {
    axisText: readCssVar('--color-text-secondary', isLight ? '#57483a' : '#d2c3a3'),
    axisLine: readCssVar('--color-border-medium', isLight ? 'rgba(118,90,51,0.28)' : 'rgba(226,198,140,0.28)'),
    splitLine: readCssVar('--color-border-light', isLight ? 'rgba(118,90,51,0.14)' : 'rgba(226,198,140,0.14)'),
    tooltipBg: readCssVar('--color-bg-card', isLight ? '#fffaf0' : '#241c14'),
    tooltipBorder: readCssVar('--color-border-medium', isLight ? 'rgba(118,90,51,0.2)' : 'rgba(226,198,140,0.2)'),
    tooltipText: readCssVar('--color-text-primary', isLight ? '#2c241c' : '#f5ecd8'),
    label: readCssVar('--color-text-primary', isLight ? '#2c241c' : '#f5ecd8'),
    bandFill: (rowName) => colorWithAlpha(hueOf(rowName), isLight ? 0.14 : 0.2),
    subFill: (rowName, type) =>
      colorWithAlpha(
        hueOf(rowName),
        type === 'ruler' ? (isLight ? 0.55 : 0.62) : isLight ? 0.32 : 0.4,
      ),
    subStroke: (rowName) => colorWithAlpha(hueOf(rowName), isLight ? 0.7 : 0.75),
  };
}
