/**
 * 朝代轮播效果(preset)的统一接口
 *
 * 每个效果只需实现 Layout(必需) 和 Particles(可选),
 * 其余卡片渲染、状态、交互都由外壳承担
 */

import type { ComponentType } from 'react';
import type { Dynasty } from '@/services/culture/types';

export interface EffectLayoutProps {
  dynasties: Dynasty[];
  activeIndex: number;
  onCardClick: (index: number) => void;
}

export interface EffectParticlesProps {
  activeIndex: number;
  total: number;
}

export type EffectCost = 'low' | 'mid' | 'high';

export interface CameraPreset {
  position: [number, number, number];
  fov: number;
  lookAt?: [number, number, number];
}

export interface DynastyEffect {
  /** 唯一标识,作为 localStorage 与 URL 用 */
  id: string;
  /** 中文名(下拉显示) */
  name: string;
  /** 一句话描述,鼠标悬停或副标题用 */
  description: string;
  /** 性能档位,用于低端设备降级 */
  cost: EffectCost;
  /** 是否已实现,未实现的在下拉里灰色显示 */
  available: boolean;
  /** 卡片排布与运动 */
  Layout: ComponentType<EffectLayoutProps>;
  /** 该效果专属粒子(可选,不写则用默认星尘) */
  Particles?: ComponentType<EffectParticlesProps>;
  /** 镜头预设,不写则用全局默认 */
  camera?: CameraPreset;
}
