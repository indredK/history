/**
 * 响应式配置系统
 * 统一管理所有组件的响应式配置
 */

export interface ResponsiveConfig {
  breakpoints: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    xs: {
      h1: string;
      h2: string;
      h3: string;
      h4: string;
      h5: string;
      h6: string;
      body1: string;
      body2: string;
      caption: string;
    };
    sm: {
      h1: string;
      h2: string;
      h3: string;
      h4: string;
      h5: string;
      h6: string;
      body1: string;
      body2: string;
      caption: string;
    };
    md: {
      h1: string;
      h2: string;
      h3: string;
      h4: string;
      h5: string;
      h6: string;
      body1: string;
      body2: string;
      caption: string;
    };
    lg: {
      h1: string;
      h2: string;
      h3: string;
      h4: string;
      h5: string;
      h6: string;
      body1: string;
      body2: string;
      caption: string;
    };
  };
  components: {
    button: {
      xs: { height: string; padding: string; fontSize: string };
      sm: { height: string; padding: string; fontSize: string };
      md: { height: string; padding: string; fontSize: string };
      lg: { height: string; padding: string; fontSize: string };
    };
    table: {
      xs: { cellPadding: string; fontSize: string; headerHeight: string };
      sm: { cellPadding: string; fontSize: string; headerHeight: string };
      md: { cellPadding: string; fontSize: string; headerHeight: string };
      lg: { cellPadding: string; fontSize: string; headerHeight: string };
    };
    sidebar: {
      xs: { width: string; itemSize: string; iconSize: string; fontSize: string };
      sm: { width: string; itemSize: string; iconSize: string; fontSize: string };
      md: { width: string; itemSize: string; iconSize: string; fontSize: string };
      lg: { width: string; itemSize: string; iconSize: string; fontSize: string };
    };
    card: {
      xs: { padding: string; borderRadius: string; margin: string };
      sm: { padding: string; borderRadius: string; margin: string };
      md: { padding: string; borderRadius: string; margin: string };
      lg: { padding: string; borderRadius: string; margin: string };
    };
  };
}

export const responsiveConfig: ResponsiveConfig = {
  breakpoints: {
    xs: 320,  // 小屏手机
    sm: 375,  // 标准手机
    md: 768,  // 平板
    lg: 1024, // 大平板/小桌面
    xl: 1200, // 桌面
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  
  typography: {
    xs: {
      h1: '1.2rem',
      h2: '1.1rem',
      h3: '1rem',
      h4: '0.9rem',
      h5: '0.8rem',
      h6: '0.75rem',
      body1: '0.7rem',
      body2: '0.65rem',
      caption: '0.6rem',
    },
    sm: {
      h1: '1.4rem',
      h2: '1.25rem',
      h3: '1.1rem',
      h4: '1rem',
      h5: '0.9rem',
      h6: '0.8rem',
      body1: '0.75rem',
      body2: '0.7rem',
      caption: '0.65rem',
    },
    md: {
      h1: '1.8rem',
      h2: '1.5rem',
      h3: '1.3rem',
      h4: '1.1rem',
      h5: '1rem',
      h6: '0.9rem',
      body1: '0.85rem',
      body2: '0.8rem',
      caption: '0.75rem',
    },
    lg: {
      h1: '2.2rem',
      h2: '1.8rem',
      h3: '1.5rem',
      h4: '1.3rem',
      h5: '1.1rem',
      h6: '1rem',
      body1: '0.9rem',
      body2: '0.85rem',
      caption: '0.8rem',
    },
  },
  
  components: {
    button: {
      xs: { height: '36px', padding: '6px 12px', fontSize: '0.7rem' },
      sm: { height: '40px', padding: '8px 16px', fontSize: '0.75rem' },
      md: { height: '44px', padding: '10px 20px', fontSize: '0.85rem' },
      lg: { height: '48px', padding: '12px 24px', fontSize: '0.9rem' },
    },
    
    table: {
      xs: { cellPadding: '2px 4px', fontSize: '0.6rem', headerHeight: '32px' },
      sm: { cellPadding: '4px 6px', fontSize: '0.65rem', headerHeight: '36px' },
      md: { cellPadding: '6px 8px', fontSize: '0.75rem', headerHeight: '40px' },
      lg: { cellPadding: '8px 12px', fontSize: '0.85rem', headerHeight: '44px' },
    },
    
    sidebar: {
      xs: { width: '100%', itemSize: '50px', iconSize: '18px', fontSize: '9px' },
      sm: { width: '100%', itemSize: '60px', iconSize: '20px', fontSize: '10px' },
      md: { width: '240px', itemSize: '48px', iconSize: '22px', fontSize: '12px' },
      lg: { width: '280px', itemSize: '52px', iconSize: '24px', fontSize: '14px' },
    },
    
    card: {
      xs: { padding: '8px', borderRadius: '6px', margin: '4px' },
      sm: { padding: '12px', borderRadius: '8px', margin: '6px' },
      md: { padding: '16px', borderRadius: '10px', margin: '8px' },
      lg: { padding: '20px', borderRadius: '12px', margin: '12px' },
    },
  },
};

// 获取当前屏幕尺寸对应的配置键
export function getResponsiveKey(width: number): keyof ResponsiveConfig['typography'] {
  if (width < responsiveConfig.breakpoints.xs) return 'xs';
  if (width < responsiveConfig.breakpoints.sm) return 'xs';
  if (width < responsiveConfig.breakpoints.md) return 'sm';
  if (width < responsiveConfig.breakpoints.lg) return 'md';
  return 'lg';
}

// 获取响应式样式（带类型安全）
export function getButtonStyles(width: number) {
  const key = getResponsiveKey(width);
  return responsiveConfig.components.button[key];
}

export function getTableStyles(width: number) {
  const key = getResponsiveKey(width);
  return responsiveConfig.components.table[key];
}

export function getSidebarStyles(width: number) {
  const key = getResponsiveKey(width);
  return responsiveConfig.components.sidebar[key];
}

export function getCardStyles(width: number) {
  const key = getResponsiveKey(width);
  return responsiveConfig.components.card[key];
}

// 通用获取函数（保留向后兼容）
export function getResponsiveStyles(component: keyof ResponsiveConfig['components'], width: number) {
  const key = getResponsiveKey(width);
  return responsiveConfig.components[component][key];
}

// 获取响应式字体
export function getResponsiveTypography(variant: keyof ResponsiveConfig['typography']['xs'], width: number) {
  const key = getResponsiveKey(width);
  return responsiveConfig.typography[key][variant];
}

// 获取响应式间距
export function getResponsiveSpacing(width: number) {
  const key = getResponsiveKey(width);
  return responsiveConfig.spacing[key];
}