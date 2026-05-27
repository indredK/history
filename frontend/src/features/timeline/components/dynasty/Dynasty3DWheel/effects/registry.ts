/**
 * 朝代轮播效果(preset)注册表
 *
 * 全部效果:arc(弧形长廊)/ orbit(环形轨道)/ vortex(粒子涡旋)/
 *           ribbon(时光飘带)/ tunnel(散景隧道)
 */

import { arcEffect } from './arcCoverflow';
import { orbitEffect } from './orbit';
import { vortexEffect } from './vortex';
import { ribbonEffect } from './ribbon';
import { tunnelEffect } from './tunnel';
import type { DynastyEffect } from './types';

export const dynastyEffects: DynastyEffect[] = [
  arcEffect,
  orbitEffect,
  vortexEffect,
  ribbonEffect,
  tunnelEffect,
];

export const DEFAULT_EFFECT_ID = 'arc';

export function getEffectById(id: string | null | undefined): DynastyEffect {
  const found = dynastyEffects.find((e) => e.id === id && e.available);
  return found ?? arcEffect;
}
