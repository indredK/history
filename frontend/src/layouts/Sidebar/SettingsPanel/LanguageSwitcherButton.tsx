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
  const buttonSize = collapsed ? 32 : 40;
  
  // 毛玻璃按钮样式
  const buttonStyle = {
    backdropFilter: 'var(--app-backdrop-light)',
    WebkitBackdropFilter: 'var(--app-backdrop-light)',
    background: 'var(--app-interactive-bg-soft)',
    border: '1px solid var(--app-interactive-border)',
    borderRadius: glassConfig.border.radius.md,
    color: 'var(--app-interactive-text)',
    width: buttonSize,
    height: buttonSize,
    minWidth: buttonSize,
    transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`,
    '&:hover': {
      background: 'var(--app-interactive-hover-bg)',
      boxShadow: 'var(--app-panel-shadow-sm)',
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(-1px) scale(0.92)',
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
          <LanguageIcon fontSize="small" />
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
