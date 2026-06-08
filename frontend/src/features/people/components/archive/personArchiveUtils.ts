import type { TagColor } from '@/components/common';
import type { CommonPerson, SourceRef } from '@/services/person/common';

export const ROLE_LABELS: Record<string, string> = {
  emperor: '帝王',
  ruler: '君主',
  empress: '后妃',
  politician: '政治家',
  reformer: '改革者',
  general: '将领',
  strategist: '谋士',
  scholar: '学者',
  philosopher: '思想家',
  poet: '诗人',
  writer: '文学家',
  historian: '史家',
  calligrapher: '书法家',
  monk: '僧侣',
  explorer: '航海家',
  diplomat: '外交家',
  revolutionary: '革命家',
  founder: '创建者',
  official: '官员',
  scientist: '科技人物',
};

const ROLE_COLORS: Record<string, TagColor> = {
  emperor: { bg: 'rgba(198, 126, 40, 0.15)', text: '#b56a18' },
  ruler: { bg: 'rgba(198, 126, 40, 0.15)', text: '#b56a18' },
  empress: { bg: 'rgba(173, 81, 132, 0.14)', text: '#a64079' },
  politician: { bg: 'rgba(38, 121, 180, 0.14)', text: '#1f73a9' },
  reformer: { bg: 'rgba(24, 137, 115, 0.14)', text: '#087d67' },
  general: { bg: 'rgba(192, 76, 56, 0.14)', text: '#b84731' },
  strategist: { bg: 'rgba(112, 95, 179, 0.14)', text: '#6557a8' },
  scholar: { bg: 'rgba(61, 128, 88, 0.14)', text: '#357a55' },
  philosopher: { bg: 'rgba(84, 115, 168, 0.14)', text: '#4f6ea4' },
  poet: { bg: 'rgba(35, 132, 146, 0.14)', text: '#177f8f' },
  writer: { bg: 'rgba(35, 132, 146, 0.14)', text: '#177f8f' },
  historian: { bg: 'rgba(141, 108, 57, 0.14)', text: '#836534' },
  monk: { bg: 'rgba(151, 112, 46, 0.14)', text: '#92651d' },
  explorer: { bg: 'rgba(42, 137, 164, 0.14)', text: '#1a7f9b' },
  diplomat: { bg: 'rgba(35, 113, 170, 0.14)', text: '#1d6ba1' },
  revolutionary: { bg: 'rgba(177, 73, 56, 0.14)', text: '#a8422d' },
  founder: { bg: 'rgba(132, 92, 176, 0.14)', text: '#7953a4' },
  official: { bg: 'rgba(85, 115, 132, 0.14)', text: '#4f6f80' },
  scientist: { bg: 'rgba(34, 137, 105, 0.14)', text: '#188466' },
};

export const DEFAULT_PERSON_COLOR: TagColor = {
  bg: 'rgba(110, 118, 129, 0.14)',
  text: 'var(--color-text-secondary)',
};

export function getRoleLabel(role?: string): string {
  if (!role) return '未标注';
  return ROLE_LABELS[role] ?? role;
}

export function getRoleColor(role?: string): TagColor {
  if (!role) return DEFAULT_PERSON_COLOR;
  return ROLE_COLORS[role] ?? DEFAULT_PERSON_COLOR;
}

export function formatLifespan(person: CommonPerson): string {
  const birth = person.birthYear ?? '?';
  const death = person.deathYear ?? '?';
  return `${birth} - ${death}`;
}

export function formatSource(source: SourceRef): string {
  return source.author ? `${source.title} · ${source.author}` : source.title;
}

export function getPrimaryRole(person: CommonPerson): string | undefined {
  return person.roles?.[0];
}
