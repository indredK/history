/**
 * 朝代标题行 —— 可点击展开/收起,显示朝代名+时段+简介+备注
 */

import { Box, TableCell, TableRow, Typography } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { tableStyles } from '../config';
import type { Dynasty, ResponsiveFlags } from './types';

interface DynastyHeaderRowProps extends ResponsiveFlags {
  dynasty: Dynasty;
  isExpanded: boolean;
  onToggle: () => void;
}

/** 标题行右侧占用的列数 */
function getColSpan(isMobile?: boolean, isSmallMobile?: boolean): number {
  if (isSmallMobile) return 4; // 朝代、姓名、纪年、大事记
  if (isMobile) return 5; // 朝代、名号、姓名、纪年、大事记
  return 8; // 桌面端全部列
}

export function DynastyHeaderRow({
  dynasty,
  isExpanded,
  onToggle,
  isMobile,
  isSmallMobile,
}: DynastyHeaderRowProps) {
  return (
    <TableRow hover sx={tableStyles.dynastyHeaderRow}>
      <TableCell
        sx={{
          ...tableStyles.dynastyCell,
          ...tableStyles.bodyCell,
          ...tableStyles.dynastyHeaderCell,
          ...(isMobile && {
            position: 'sticky',
            left: 0,
            zIndex: 10,
            fontSize: isSmallMobile ? '0.65rem' : '0.7rem',
            padding: isSmallMobile ? '4px 3px' : '6px 8px',
            minWidth: isSmallMobile ? '60px' : '80px',
            maxWidth: isSmallMobile ? '80px' : '100px',
          }),
        }}
        onClick={onToggle}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                ...tableStyles.dynastyName,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: 'inherit',
                lineHeight: 1.2,
                wordBreak: 'break-all',
              }}
            >
              {dynasty.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                ...tableStyles.dynastyPeriod,
                fontSize: isMobile
                  ? isSmallMobile
                    ? '0.55rem'
                    : '0.6rem'
                  : 'inherit',
                lineHeight: 1.1,
              }}
            >
              {dynasty.period}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-primary)',
              fontSize: '0.8rem',
            }}
          >
            <ExpandLessIcon
              sx={{
                ...tableStyles.expandIcon,
                transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                fontSize: isMobile
                  ? isSmallMobile
                    ? '1rem'
                    : '1.1rem'
                  : '1.2rem',
              }}
            />
          </Box>
        </Box>
      </TableCell>
      <TableCell
        colSpan={getColSpan(isMobile, isSmallMobile)}
        sx={{
          ...tableStyles.bodyCell,
          fontStyle: 'italic',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          backgroundColor: 'var(--theme-glass-bg-light)',
          transition:
            'all var(--glass-duration-normal, 250ms) var(--glass-easing, cubic-bezier(0.4, 0, 0.2, 1))',
          '&:hover': {
            backgroundColor: 'var(--theme-glass-bg)',
            boxShadow: 'var(--theme-shadow-sm)',
          },
          ...(isMobile && {
            fontSize: isSmallMobile ? '0.6rem' : '0.7rem',
            padding: isSmallMobile ? '4px 3px' : '6px 8px',
            lineHeight: 1.2,
          }),
        }}
        onClick={onToggle}
      >
        {dynasty.summary && (
          <Typography
            variant="body2"
            sx={{
              fontStyle: 'normal',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.4,
              mb: 0.5,
              fontSize: 'inherit',
            }}
          >
            {dynasty.summary}
          </Typography>
        )}
        {dynasty.note && (
          <Typography
            variant="body2"
            sx={{
              fontStyle: 'italic',
              color: 'var(--color-text-tertiary)',
              fontSize: isMobile
                ? isSmallMobile
                  ? '0.55rem'
                  : '0.65rem'
                : '0.85rem',
            }}
          >
            {dynasty.note}
          </Typography>
        )}
      </TableCell>
    </TableRow>
  );
}
