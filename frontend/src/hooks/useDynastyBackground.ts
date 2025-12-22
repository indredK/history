/**
 * 朝代背景样式 Hook
 * Dynasty Background Style Hook
 * 
 * 提供朝代相关的背景颜色和图片样式
 */

import { useMemo } from 'react';
import { useDynastyStore } from '@/store';
import { useDynastyImage } from './useDynastyImage';
import { dynastyUtils } from '@/config';

interface DynastyBackgroundStyle {
  background: string;
  backgroundColor: string;
  backgroundSize: string;
  backgroundAttachment: string;
  transition: string;
}

/**
 * 获取朝代背景样式
 * 用于在特定页面（如时间轴）应用朝代主题背景
 */
export function useDynastyBackground(isMobile: boolean = false): DynastyBackgroundStyle {
  const { selectedDynasty } = useDynastyStore();
  const { imageUrl: dynastyBackgroundUrl } = useDynastyImage(selectedDynasty?.id ?? null);
  
  return useMemo(() => {
    const dynastyColor = selectedDynasty?.color;
    const bgColor = dynastyUtils.getBackgroundColor(dynastyColor);
    const gradientBackground = dynastyUtils.getGradientBackground(dynastyColor);
    
    return {
      background: selectedDynasty && dynastyBackgroundUrl ?
        `${gradientBackground},
        url(${dynastyBackgroundUrl}) no-repeat center center ${isMobile ? 'scroll' : 'fixed'},
        var(--color-bg-gradient)`
        : 'var(--color-bg-gradient)',
      backgroundColor: selectedDynasty ? bgColor : 'transparent',
      backgroundSize: 'cover',
      backgroundAttachment: isMobile ? 'scroll' : 'fixed',
      transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1), background-color 350ms cubic-bezier(0.4, 0, 0.2, 1)',
    };
  }, [selectedDynasty, dynastyBackgroundUrl, isMobile]);
}

/**
 * 检查是否有选中的朝代
 */
export function useHasSelectedDynasty(): boolean {
  const { selectedDynasty } = useDynastyStore();
  return !!selectedDynasty;
}

export default useDynastyBackground;