import { SxProps, Theme } from '@mui/material/styles';

// 通用的浮框样式配置
export const popoverPaperStyles: SxProps<Theme> = {
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
};

// 浮框内容区域的样式
export const popoverContentStyles: SxProps<Theme> = {
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
};

// 通用的Popover配置
export const popoverProps = {
  disableScrollLock: true,
  elevation: 0, // 使用自定义阴影
  anchorOrigin: { vertical: 'center' as const, horizontal: 'right' as const },
  transformOrigin: { vertical: 'center' as const, horizontal: 'left' as const },
  slotProps: {
    paper: {
      sx: popoverPaperStyles
    }
  }
};

// 功能面板按钮的统一样式
export const functionButtonStyles: SxProps<Theme> = {
  backgroundColor: 'var(--color-bg-tertiary)',
  borderRadius: 'var(--radius-lg)',
  padding: '6px 12px',
  borderColor: 'var(--color-border-medium)',
  '&:hover': {
    backgroundColor: 'var(--color-bg-quaternary)',
    borderColor: 'var(--color-primary)',
    boxShadow: 'var(--shadow-md)'
  }
};

// 搜索框的统一样式
export const searchFieldStyles: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'var(--color-bg-tertiary)',
    border: '2px solid var(--color-border-medium)',
    '&:hover': {
      borderColor: 'var(--color-primary)',
      boxShadow: '0 0 10px rgba(255, 61, 0, 0.2)'
    },
    '&.Mui-focused': {
      borderColor: 'var(--color-primary)',
      boxShadow: '0 0 20px rgba(255, 61, 0, 0.3)'
    },
    transition: 'all var(--transition-normal)'
  }
};

// 主题色彩配置
export const themeColors = {
  timeline: {
    primary: 'var(--color-primary)', // #FF3D00
    hover: 'rgba(255, 61, 0, 0.1)',
    shadow: 'rgba(255, 61, 0, 0.2)'
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
  }
};

// 根据主题生成搜索框样式
export const getThemedSearchFieldStyles = (theme: keyof typeof themeColors): SxProps<Theme> => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'var(--color-bg-tertiary)',
    border: '2px solid var(--color-border-medium)',
    '&:hover': {
      borderColor: themeColors[theme].primary,
      boxShadow: `0 0 10px ${themeColors[theme].shadow}`
    },
    '&.Mui-focused': {
      borderColor: themeColors[theme].primary,
      boxShadow: `0 0 20px ${themeColors[theme].shadow}`
    },
    transition: 'all var(--transition-normal)'
  }
});

// 根据主题生成Checkbox样式
export const getThemedCheckboxStyles = (theme: keyof typeof themeColors): SxProps<Theme> => ({
  color: 'var(--color-text-secondary)',
  '&.Mui-checked': {
    color: themeColors[theme].primary,
  }
});

// 根据主题生成Chip样式
export const getThemedChipStyles = (theme: keyof typeof themeColors): SxProps<Theme> => ({
  borderColor: 'var(--color-border-medium)',
  color: 'var(--color-text-primary)',
  '&:hover': {
    borderColor: themeColors[theme].primary,
    backgroundColor: themeColors[theme].hover
  }
});

// 根据主题生成Slider样式
export const getThemedSliderStyles = (theme: keyof typeof themeColors): SxProps<Theme> => ({
  color: themeColors[theme].primary,
  '& .MuiSlider-thumb': {
    backgroundColor: themeColors[theme].primary,
    '&:hover': {
      boxShadow: `0 0 0 8px ${themeColors[theme].hover}`,
    }
  },
  '& .MuiSlider-track': {
    backgroundColor: themeColors[theme].primary,
  },
  '& .MuiSlider-rail': {
    backgroundColor: 'var(--color-border-medium)',
  }
});

// 根据主题生成ToggleButton样式
export const getThemedToggleButtonStyles = (theme: keyof typeof themeColors): SxProps<Theme> => ({
  '& .MuiToggleButton-root': {
    borderColor: 'var(--color-border-medium)',
    color: 'var(--color-text-primary)',
    '&:hover': {
      backgroundColor: themeColors[theme].hover,
      borderColor: themeColors[theme].primary,
    },
    '&.Mui-selected': {
      backgroundColor: themeColors[theme].primary,
      color: 'white',
      '&:hover': {
        backgroundColor: themeColors[theme].primary,
      }
    }
  }
});

// 通用的FormControlLabel样式
export const formControlLabelStyles: SxProps<Theme> = {
  margin: 0
};

// 通用的分割线样式
export const dividerStyles: SxProps<Theme> = {
  my: 1,
  borderColor: 'var(--color-border-light)',
  opacity: 0.6
};

// 通用的Typography caption样式
export const captionStyles: SxProps<Theme> = {
  color: 'var(--color-text-tertiary)',
  mb: 1,
  display: 'block'
};

// 根据主题生成Button样式（用于Popover内的按钮）
export const getThemedButtonStyles = (theme: keyof typeof themeColors): SxProps<Theme> => ({
  borderRadius: 'var(--radius-md)',
  borderColor: 'var(--color-border-medium)',
  color: 'var(--color-text-primary)',
  backgroundColor: 'transparent',
  '&:hover': {
    borderColor: themeColors[theme].primary,
    backgroundColor: themeColors[theme].hover,
    color: themeColors[theme].primary
  }
});

// 根据主题生成主要操作按钮样式
export const getThemedPrimaryButtonStyles = (theme: keyof typeof themeColors): SxProps<Theme> => ({
  backgroundColor: themeColors[theme].primary,
  borderRadius: 'var(--radius-md)',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: `0 2px 8px ${themeColors[theme].shadow}`,
  '&:hover': {
    backgroundColor: themeColors[theme].primary,
    boxShadow: `0 4px 16px ${themeColors[theme].shadow}`,
    transform: 'translateY(-1px)'
  },
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
});