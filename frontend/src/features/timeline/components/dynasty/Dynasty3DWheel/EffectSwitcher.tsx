/**
 * 右上角效果切换器
 *
 * 浮动在 canvas 右上角,不影响布局;点击展开 Menu 选择效果。
 * 已实现的效果可点击,未实现的灰色显示"敬请期待"。
 */

import { useRef, useState, useCallback } from 'react';
import { Menu, MenuItem, ListItemText, Tooltip, Chip } from '@mui/material';
import { TuneRounded } from '@mui/icons-material';
import { ResponsiveIconButton } from '@/components/ui';
import { dynastyEffects } from './effects/registry';

interface EffectSwitcherProps {
  currentId: string;
  onChange: (id: string) => void;
}

export function EffectSwitcher({ currentId, onChange }: EffectSwitcherProps) {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (id: string) => {
      onChange(id);
      setOpen(false);
    },
    [onChange],
  );

  const current = dynastyEffects.find((e) => e.id === currentId);

  return (
    <>
      <Tooltip title={`效果:${current?.name ?? '弧形长廊'}`} arrow>
        <span className="dynasty-effect-switcher">
          <ResponsiveIconButton
            ref={anchorRef}
            aria-label="切换轮播效果"
            onClick={() => setOpen((v) => !v)}
            responsive={false}
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              color: 'var(--color-text-secondary)',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(var(--glass-surface-soft-rgb), 0.78)',
              border: '1px solid var(--theme-glass-border-light)',
              '&:hover': {
                backgroundColor: 'rgba(var(--glass-surface-soft-rgb), 0.92)',
              },
            }}
          >
            <TuneRounded fontSize="small" />
          </ResponsiveIconButton>
        </span>
      </Tooltip>

      <Menu
        anchorEl={anchorRef.current}
        open={open}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 220,
              backdropFilter: 'blur(12px)',
              backgroundColor: 'rgba(var(--glass-surface-rgb), 0.94)',
              border: '1px solid var(--theme-glass-border-light)',
            },
          },
        }}
      >
        {dynastyEffects.map((effect) => {
          const disabled = !effect.available;
          const isCurrent = effect.id === currentId;
          return (
            <MenuItem
              key={effect.id}
              disabled={disabled}
              selected={isCurrent}
              onClick={() => handleSelect(effect.id)}
              sx={{
                alignItems: 'flex-start',
                py: 1,
                gap: 1,
                opacity: disabled ? 0.55 : 1,
              }}
            >
              <ListItemText
                primary={
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {effect.name}
                    {disabled && (
                      <Chip
                        size="small"
                        label="敬请期待"
                        sx={{ height: 16, fontSize: 10 }}
                      />
                    )}
                  </span>
                }
                secondary={effect.description}
                slotProps={{
                  primary: { sx: { fontSize: 13, fontWeight: 600 } },
                  secondary: { sx: { fontSize: 11, lineHeight: 1.3 } },
                }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
