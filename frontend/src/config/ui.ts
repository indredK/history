/**
 * UI组件配置文件
 * 统一管理Popover、Button、Form等UI组件的样式配置
 */

import { SxProps, Theme } from '@mui/material/styles';

// Popover 配置
export const popoverConfig = {
  // 通用的浮框样式配置
  paperStyles: {
    borderRadius: 'var(--radius-xl)',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: `
      0 8px 32px rgba(0, 0, 0, 0.12),
      0 2px 8px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.4)
    `,
    // 暗色模式适配
    '@media (prefers-color-scheme: dark)': {
      background: 'rgba(30, 30, 30, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: `
        0 8px 32px rgba(0, 0, 0, 0.3),
        0 2px 8px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1)
      `,
    },
    // 添加微妙的动画效果
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    // 确保在不同背景下都有良好的对比度
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 'inherit',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      pointerEvents: 'none',
      zIndex: -1,
    }
  } as SxProps<Theme>,

  // 浮框内容区域的样式
  contentStyles: {
    p: 3,
    minWidth: 280,
    position: 'relative',
    zIndex: 1,
    // 确保文字在任何背景下都清晰可见
    '& .MuiTypography-root': {
      color: 'var(--color-text-primary)',
    },
    '& .MuiTypography-subtitle1': {
      fontWeight: 600,
      marginBottom: 2,
      color: 'var(--color-text-primary)',
    },
    '& .MuiTypography-body2': {
      color: 'var(--color-text-secondary)',
    },
    '& .MuiTypography-caption': {
      color: 'var(--color-text-tertiary)',
    }
  } as SxProps<Theme>,

  // 通用的Popover配置
  defaultProps: {
    disableScrollLock: true,
    elevation: 0, // 使用自定义阴影
    anchorOrigin: { vertical: 'center' as const, horizontal: 'right' as const },
    transformOrigin: { vertical: 'center' as const, horizontal: 'left' as const }
  }
};

// 按钮配置
export const buttonConfig = {
  // 功能面板按钮的统一样式
  functionButton: {
    backgroundColor: 'var(--color-bg-tertiary)',
    borderRadius: 'var(--radius-lg)',
    padding: '6px 12px',
    borderColor: 'var(--color-border-medium)',
    '&:hover': {
      backgroundColor: 'var(--color-bg-quaternary)',
      borderColor: 'var(--color-primary)',
      boxShadow: 'var(--shadow-md)'
    }
  } as SxProps<Theme>,

  // 通用按钮样式（用于Popover内的按钮）
  base: {
    borderRadius: 'var(--radius-md)',
    borderColor: 'var(--color-border-medium)',
    color: 'var(--color-text-primary)',
    backgroundColor: 'transparent',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
  } as SxProps<Theme>,

  // 主要操作按钮样式
  primary: {
    borderRadius: 'var(--radius-md)',
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
  } as SxProps<Theme>
};

// 表单控件配置
export const formConfig = {
  // 搜索框的统一样式
  searchField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--color-bg-tertiary)',
      border: '2px solid var(--color-border-medium)',
      transition: 'all var(--transition-normal)'
    }
  } as SxProps<Theme>,

  // 通用的FormControlLabel样式
  controlLabel: {
    margin: 0
  } as SxProps<Theme>,

  // Checkbox基础样式
  checkbox: {
    color: 'var(--color-text-secondary)'
  } as SxProps<Theme>,

  // Chip基础样式
  chip: {
    borderColor: 'var(--color-border-medium)',
    color: 'var(--color-text-primary)'
  } as SxProps<Theme>,

  // Slider基础样式
  slider: {
    '& .MuiSlider-rail': {
      backgroundColor: 'var(--color-border-medium)',
    }
  } as SxProps<Theme>,

  // ToggleButton基础样式
  toggleButton: {
    '& .MuiToggleButton-root': {
      borderColor: 'var(--color-border-medium)',
      color: 'var(--color-text-primary)'
    }
  } as SxProps<Theme>
};

// 通用样式配置
export const commonStyles = {
  // 通用的分割线样式
  divider: {
    my: 1,
    borderColor: 'var(--color-border-light)',
    opacity: 0.6
  } as SxProps<Theme>,

  // 通用的Typography caption样式
  caption: {
    color: 'var(--color-text-tertiary)',
    mb: 1,
    display: 'block'
  } as SxProps<Theme>
};

// 主题色彩配置
export const uiThemeColors = {
  timeline: {
    primary: 'var(--color-primary)', // #FF3D00
    hover: 'rgba(255, 61, 0, 0.1)',
    shadow: 'rgba(255, 61, 0, 0.2)'
  },
  dynasties: {
    primary: '#D32F2F',
    hover: 'rgba(211, 47, 47, 0.1)',
    shadow: 'rgba(211, 47, 47, 0.2)'
  },
  map: {
    primary: 'var(--color-secondary)', // #03A9F4
    hover: 'rgba(3, 169, 244, 0.1)',
    shadow: 'rgba(3, 169, 244, 0.2)'
  },
  people: {
    primary: '#4CAF50',
    hover: 'rgba(76, 175, 80, 0.1)',
    shadow: 'rgba(76, 175, 80, 0.2)'
  },
  culture: {
    primary: '#9C27B0',
    hover: 'rgba(156, 39, 176, 0.1)',
    shadow: 'rgba(156, 39, 176, 0.2)'
  },
  mythology: {
    primary: '#FF9800',
    hover: 'rgba(255, 152, 0, 0.1)',
    shadow: 'rgba(255, 152, 0, 0.2)'
  },
  events: {
    primary: '#607D8B',
    hover: 'rgba(96, 125, 139, 0.1)',
    shadow: 'rgba(96, 125, 139, 0.2)'
  }
};

// UI工具函数
export const uiUtils = {
  // 获取Popover完整配置
  getPopoverProps: () => ({
    ...popoverConfig.defaultProps,
    slotProps: {
      paper: {
        sx: popoverConfig.paperStyles
      }
    }
  }),

  // 根据主题生成搜索框样式
  getThemedSearchFieldStyles: (theme: keyof typeof uiThemeColors): SxProps<Theme> => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--color-bg-tertiary)',
      border: '2px solid var(--color-border-medium)',
      transition: 'all var(--transition-normal)',
      '&:hover': {
        borderColor: uiThemeColors[theme].primary,
        boxShadow: `0 0 10px ${uiThemeColors[theme].shadow}`
      },
      '&.Mui-focused': {
        borderColor: uiThemeColors[theme].primary,
        boxShadow: `0 0 20px ${uiThemeColors[theme].shadow}`
      }
    }
  }),

  // 根据主题生成Checkbox样式
  getThemedCheckboxStyles: (theme: keyof typeof uiThemeColors): SxProps<Theme> => ({
    ...formConfig.checkbox,
    '&.Mui-checked': {
      color: uiThemeColors[theme].primary,
    }
  }),

  // 根据主题生成Chip样式
  getThemedChipStyles: (theme: keyof typeof uiThemeColors): SxProps<Theme> => ({
    ...formConfig.chip,
    '&:hover': {
      borderColor: uiThemeColors[theme].primary,
      backgroundColor: uiThemeColors[theme].hover
    }
  }),

  // 根据主题生成Slider样式
  getThemedSliderStyles: (theme: keyof typeof uiThemeColors): SxProps<Theme> => ({
    color: uiThemeColors[theme].primary,
    '& .MuiSlider-thumb': {
      backgroundColor: uiThemeColors[theme].primary,
      '&:hover': {
        boxShadow: `0 0 0 8px ${uiThemeColors[theme].hover}`,
      }
    },
    '& .MuiSlider-track': {
      backgroundColor: uiThemeColors[theme].primary,
    },
    ...formConfig.slider
  }),

  // 根据主题生成ToggleButton样式
  getThemedToggleButtonStyles: (theme: keyof typeof uiThemeColors): SxProps<Theme> => ({
    '& .MuiToggleButton-root': {
      borderColor: 'var(--color-border-medium)',
      color: 'var(--color-text-primary)',
      '&:hover': {
        backgroundColor: uiThemeColors[theme].hover,
        borderColor: uiThemeColors[theme].primary,
      },
      '&.Mui-selected': {
        backgroundColor: uiThemeColors[theme].primary,
        color: 'white',
        '&:hover': {
          backgroundColor: uiThemeColors[theme].primary,
        }
      }
    }
  }),

  // 根据主题生成Button样式（用于Popover内的按钮）
  getThemedButtonStyles: (theme: keyof typeof uiThemeColors): SxProps<Theme> => ({
    ...buttonConfig.base,
    '&:hover': {
      borderColor: uiThemeColors[theme].primary,
      backgroundColor: uiThemeColors[theme].hover,
      color: uiThemeColors[theme].primary
    }
  }),

  // 根据主题生成主要操作按钮样式
  getThemedPrimaryButtonStyles: (theme: keyof typeof uiThemeColors): SxProps<Theme> => ({
    ...buttonConfig.primary,
    backgroundColor: uiThemeColors[theme].primary,
    boxShadow: `0 2px 8px ${uiThemeColors[theme].shadow}`,
    '&:hover': {
      backgroundColor: uiThemeColors[theme].primary,
      boxShadow: `0 4px 16px ${uiThemeColors[theme].shadow}`,
      transform: 'translateY(-1px)'
    }
  })
};

export default {
  popoverConfig,
  buttonConfig,
  formConfig,
  commonStyles,
  uiThemeColors,
  uiUtils
};