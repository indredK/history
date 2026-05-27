/**
 * 统治者行 —— 单个统治者(或单个年号)在表格中的一行
 *
 * 当一个统治者拥有多个年号时,会渲染多行,首行使用 rowSpan
 * 跨越朝代/名号/姓名/大事记列,后续行只填年号相关数据。
 */

import { memo } from 'react';
import {
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { tableStyles } from '../config';
import type { ResponsiveFlags, Ruler, YearName } from './types';

const muted = (
  <span style={{ color: 'var(--color-text-muted)' }}>-</span>
);

interface RulerRowProps extends ResponsiveFlags {
  ruler: Ruler;
  dynastyName: string;
  subDynastyName?: string | undefined;
  yearName?: YearName | undefined;
  isFirstYearName?: boolean;
  rowSpan?: number;
}

export const RulerRow = memo(
  ({
    ruler,
    dynastyName,
    subDynastyName,
    yearName,
    isFirstYearName,
    rowSpan,
    isMobile,
    isSmallMobile,
  }: RulerRowProps) => (
    <TableRow hover sx={tableStyles.tableRow}>
      {/* 朝代列 —— 移动端固定,毛玻璃效果 */}
      {isFirstYearName && (
        <TableCell
          sx={{
            ...tableStyles.dynastyCell,
            ...tableStyles.bodyCell,
            backgroundColor: 'var(--theme-glass-bg-light)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            ...(isMobile && {
              position: 'sticky',
              left: 0,
              zIndex: 10,
              minWidth: isSmallMobile ? '60px' : '80px',
              maxWidth: isSmallMobile ? '80px' : '100px',
              fontSize: isSmallMobile ? '0.65rem' : '0.7rem',
              padding: isSmallMobile ? '4px 3px' : '6px 8px',
            }),
          }}
          rowSpan={rowSpan}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'medium',
              fontSize: 'inherit',
              lineHeight: 1.2,
              wordBreak: 'break-all',
            }}
          >
            {subDynastyName || dynastyName}
          </Typography>
        </TableCell>
      )}

      {/* 名号列 —— 小屏手机隐藏 */}
      {!isSmallMobile && isFirstYearName && (
        <TableCell
          sx={{
            ...tableStyles.bodyCell,
            verticalAlign: 'top',
            ...(isMobile && { fontSize: '0.7rem', padding: '6px 8px' }),
          }}
          rowSpan={rowSpan}
        >
          <span style={tableStyles.rulerTitle}>{ruler.title || muted}</span>
        </TableCell>
      )}

      {/* 姓名列 */}
      {isFirstYearName && (
        <TableCell
          sx={{
            ...tableStyles.bodyCell,
            verticalAlign: 'top',
            ...(isMobile && {
              fontSize: isSmallMobile ? '0.65rem' : '0.7rem',
              padding: isSmallMobile ? '4px 3px' : '6px 8px',
              minWidth: isSmallMobile ? '50px' : '70px',
            }),
          }}
          rowSpan={rowSpan}
        >
          {ruler.name || muted}
        </TableCell>
      )}

      {/* 年号列 —— 小屏手机隐藏 */}
      {!isSmallMobile && (
        <TableCell
          sx={{
            ...tableStyles.bodyCell,
            ...(isMobile && { fontSize: '0.7rem', padding: '6px 8px' }),
          }}
        >
          {yearName ? (
            <>
              {yearName.name || muted}
              {yearName.note && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: 'var(--color-text-secondary)',
                    fontStyle: 'italic',
                    fontSize: isMobile ? '0.6rem' : 'inherit',
                  }}
                >
                  {yearName.note}
                </Typography>
              )}
            </>
          ) : (
            ruler.yearName || muted
          )}
        </TableCell>
      )}

      {/* 使用年数列 —— 移动端隐藏 */}
      {!isMobile && (
        <TableCell sx={tableStyles.bodyCell} align="center">
          {yearName?.duration || ruler.duration || muted}
        </TableCell>
      )}

      {/* 元年干支列 —— 移动端隐藏 */}
      {!isMobile && (
        <TableCell sx={tableStyles.bodyCell} align="center">
          {yearName?.ganZhi || ruler.ganZhi || muted}
        </TableCell>
      )}

      {/* 改元月份列 —— 移动端隐藏 */}
      {!isMobile && (
        <TableCell sx={tableStyles.bodyCell} align="center">
          {yearName?.changeMonth || ruler.changeMonth || muted}
        </TableCell>
      )}

      {/* 公元纪年列 */}
      <TableCell
        sx={{
          ...tableStyles.bodyCell,
          ...(isMobile && {
            fontSize: isSmallMobile ? '0.65rem' : '0.7rem',
            padding: isSmallMobile ? '4px 3px' : '6px 8px',
            minWidth: isSmallMobile ? '60px' : '80px',
          }),
        }}
        align="center"
      >
        <span style={tableStyles.startYear}>
          {yearName?.startYear || ruler.startYear || muted}
        </span>
      </TableCell>
    </TableRow>
  )
);

RulerRow.displayName = 'RulerRow';
