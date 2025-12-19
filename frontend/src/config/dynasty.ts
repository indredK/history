/**
 * 朝代相关配置文件
 * 统一管理朝代颜色、样式等配置
 */

// 朝代颜色配置
export const dynastyConfig = {
  // 默认朝代颜色
  defaultColor: '#8B4513',
  
  // 朝代颜色透明度配置
  alphaLevels: {
    background: 0.12,      // 背景透明度
    gradient1: 0.15,       // 渐变色1透明度
    gradient2: 0.08,       // 渐变色2透明度
    card: 0.6,            // 卡片透明度
    cardActive: 1.0,      // 活跃卡片透明度
    border: 0.4,          // 边框透明度
    glow: 0.3,            // 发光效果透明度
    shimmer: 0.1,         // 闪光效果透明度
    emissive: 0.1,        // 3D材质发光强度
    emissiveActive: 0.5   // 3D活跃材质发光强度
  },
  
  // 朝代相关的渐变配置
  gradientSuffixes: {
    light: 'cc',    // 80% opacity (204/255)
    medium: '88',   // 53% opacity (136/255)
    dark: '66'      // 40% opacity (102/255)
  },
  
  // 3D效果配置
  threeDConfig: {
    cardScale: {
      default: 0.85,
      active: 1.15,
      hover: 0.95,
      pulseAmplitude: 0.03
    },
    geometry: {
      cardWidth: 2.2,
      cardHeight: 2.4,
      borderWidth: 2.3,
      borderHeight: 2.5
    },
    material: {
      metalness: 0.3,
      roughness: 0.4,
      opacity: {
        default: 0.6,
        active: 1.0
      }
    },
    spacing: 3, // 卡片间距
    animation: {
      moveSpeed: 0.1,
      pulseSpeed: 2
    }
  },
  
  // 卡片样式配置
  cardStyles: {
    borderRadius: '10px',
    padding: '12px',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
    fontSize: {
      title: {
        default: '15px',
        active: '18px'
      },
      subtitle: '9px',
      period: '10px',
      description: '8px'
    },
    colors: {
      text: 'white',
      border: {
        default: 'rgba(255,255,255,0.1)',
        active: 'rgba(255,255,255,0.4)'
      },
      periodBackground: 'rgba(255,255,255,0.2)'
    }
  }
};

// 朝代颜色工具函数
export const dynastyUtils = {
  // 将朝代颜色转换为rgba格式
  getColorWithAlpha: (color: string | undefined, alpha: number): string => {
    if (!color) return `rgba(139, 69, 19, ${alpha})`;
    
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    return color;
  },
  
  // 获取朝代渐变色
  getGradient: (color: string | undefined, suffix: keyof typeof dynastyConfig.gradientSuffixes = 'light'): string => {
    const dynastyColor = color || dynastyConfig.defaultColor;
    const suffixValue = dynastyConfig.gradientSuffixes[suffix];
    return `linear-gradient(135deg, ${dynastyColor}${suffixValue}, ${dynastyColor}${dynastyConfig.gradientSuffixes.medium})`;
  },
  
  // 获取朝代发光效果
  getGlow: (color: string | undefined, intensity: number = dynastyConfig.alphaLevels.glow): string => {
    const dynastyColor = color || dynastyConfig.defaultColor;
    return `0 0 20px ${dynastyUtils.getColorWithAlpha(dynastyColor, intensity)}`;
  },
  
  // 获取朝代背景色
  getBackgroundColor: (color: string | undefined): string => {
    return dynastyUtils.getColorWithAlpha(color, dynastyConfig.alphaLevels.background);
  },
  
  // 获取朝代渐变背景
  getGradientBackground: (color: string | undefined): string => {
    const gradientColor1 = dynastyUtils.getColorWithAlpha(color, dynastyConfig.alphaLevels.gradient1);
    const gradientColor2 = dynastyUtils.getColorWithAlpha(color, dynastyConfig.alphaLevels.gradient2);
    return `linear-gradient(135deg, ${gradientColor1} 0%, ${gradientColor2} 100%)`;
  },
  
  // 获取3D材质配置
  getMaterialConfig: (color: string | undefined, isActive: boolean = false) => {
    const dynastyColor = color || dynastyConfig.defaultColor;
    return {
      color: dynastyColor,
      emissiveIntensity: isActive ? dynastyConfig.alphaLevels.emissiveActive : dynastyConfig.alphaLevels.emissive,
      metalness: dynastyConfig.threeDConfig.material.metalness,
      roughness: dynastyConfig.threeDConfig.material.roughness,
      opacity: isActive ? dynastyConfig.threeDConfig.material.opacity.active : dynastyConfig.threeDConfig.material.opacity.default
    };
  },
  
  // 获取卡片样式
  getCardStyle: (color: string | undefined, isActive: boolean = false) => {
    const dynastyColor = color || dynastyConfig.defaultColor;
    return {
      background: dynastyUtils.getGradient(dynastyColor, 'light'),
      borderRadius: dynastyConfig.cardStyles.borderRadius,
      padding: dynastyConfig.cardStyles.padding,
      backdropFilter: dynastyConfig.cardStyles.backdropFilter,
      boxShadow: dynastyConfig.cardStyles.boxShadow,
      transition: dynastyConfig.cardStyles.transition,
      textAlign: 'center' as const,
      color: dynastyConfig.cardStyles.colors.text,
      position: 'relative' as const,
      overflow: 'hidden' as const,
      border: `1px solid ${isActive ? dynastyConfig.cardStyles.colors.border.active : dynastyConfig.cardStyles.colors.border.default}`,
      transform: `scale(${isActive ? 1 : 0.85})`
    };
  }
};

export default {
  dynastyConfig,
  dynastyUtils
};