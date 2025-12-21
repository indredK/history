/**
 * 语言切换按钮组件（预留）
 * Language Switcher Button Component (Placeholder)
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

import { useState } from 'react';
import { IconButton, Tooltip, Snackbar } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useResponsive } from '@/hooks';
import { getGlassConfig } from '@/config/glassConfig';

interface LanguageSwitcherButtonProps {
  /** 是否为折叠状态 */
  collapsed: boolean;
}

export function LanguageSwitcherButton({ collapsed }: LanguageSwitcherButtonProps) {
  const [showMessage, setShowMessage] = useState(false);
  const { screenWidth } = useResponsive();
  const glassConfig = getGlassConfig(screenWidth);
  
  const label = '切换语言';
  const comingSoonMessage = '语言切换功能即将推出';
  
  const handleClick = () => {
    setShowMessage(true);
  };
  
  // 折叠状态下使用更小的按钮尺寸
  const buttonSize = collapsed ? 36 : 44;
  
  // 毛玻璃按钮样式
  const buttonStyle = {
    backdropFilter: `blur(${glassConfig.blur.light})`,
    WebkitBackdropFilter: `blur(${glassConfig.blur.light})`,
    background: 'var(--theme-glass-bg-light)',
    border: '1px solid var(--theme-glass-border)',
    borderRadius: glassConfig.border.radius.md,
    color: 'var(--theme-icon-primary)',
    width: buttonSize,
    height: buttonSize,
    minWidth: buttonSize,
    transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`,
    '&:hover': {
      background: 'var(--theme-glass-bg)',
      boxShadow: glassConfig.shadow.glow,
    },
  };

  return (
    <>
      <Tooltip title={`${label} (${comingSoonMessage})`} placement={collapsed ? 'right' : 'top'}>
        <IconButton
          onClick={handleClick}
          sx={buttonStyle}
          aria-label={label}
        >
          <LanguageIcon fontSize={collapsed ? 'small' : 'medium'} />
        </IconButton>
      </Tooltip>
      <Snackbar
        open={showMessage}
        autoHideDuration={2000}
        onClose={() => setShowMessage(false)}
        message={comingSoonMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}
