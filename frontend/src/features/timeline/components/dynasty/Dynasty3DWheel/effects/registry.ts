/**
 * 朝代轮播效果(preset)注册表
 *
 * 第一批已实现:arc(弧形长廊)
 * 后续四个先占位,下拉里显示"敬请期待",available=false
 */

import { arcEffect } from './arcCoverflow';
import type { DynastyEffect } from './types';

const placeholder = (
  id: string,
  name: string,
  description: string,
  cost: DynastyEffect['cost'],
): DynastyEffect => ({
  id,
  name,
  description,
  cost,
  available: false,
  // 未实现时回落到 arc 的 Layout,保证类型安全;但下拉里会被禁用,实际不会被选中
  Layout: arcEffect.Layout,
});

export const dynastyEffects: DynastyEffect[] = [
  arcEffect,
  placeholder('orbit', '环形轨道', '完整 360°,沿切线喷粒子尾迹', 'mid'),
  placeholder('vortex', '粒子涡旋', '中心粒子带高速旋转,卡片穿过', 'mid'),
  placeholder('ribbon', '时光飘带', '卡片串在立体丝带上,丝带由粒子构成', 'high'),
  placeholder('tunnel', '散景隧道', '卡片由远及近,背景同心粒子环', 'mid'),
];

export const DEFAULT_EFFECT_ID = 'arc';

export function getEffectById(id: string | null | undefined): DynastyEffect {
  const found = dynastyEffects.find((e) => e.id === id && e.available);
  return found ?? arcEffect;
}
