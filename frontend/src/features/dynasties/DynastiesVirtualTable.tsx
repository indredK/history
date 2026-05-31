/**
 * 朝代虚拟化表格
 *
 * 用 @tanstack/react-virtual 做行虚拟化，CSS Grid 的 div 行布局替代 MUI <Table>。
 * 关键点：
 *  - useResponsive / useStyleStore / getGlassConfig / getTableStyles 仅在本组件调用一次，
 *    派生值经 useMemo 下发，单元格不再各自调用 hook（消除原 ResponsiveTableCell 的逐格开销）。
 *  - 固定行高，estimateSize 用常量，不使用 measureElement。
 *  - sticky 表头(top:0) + sticky 首列(left:0) + 横向原生滚动，共处同一 overflow:auto 容器。
 *  - 斑马纹/hover 通过 2 个稳定 sx 引用实现（不能用内联 style 设背景，否则覆盖 :hover）。
 */

import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useResponsive } from '@/hooks/useResponsive';
import { useStyleStore } from '@/store';
import { getTableStyles } from '@/config/responsive';
import { columns, tableStyles, tableConfig } from './config';
import type { TableRowData } from './types';
import {
  getVisibleColumns,
  getGridTemplate,
  getRowSizing,
  getRowHeight,
  getHeaderHeight,
} from './virtualTableLayout';
import { buildGlassStyles } from './virtualTableStyles';

interface DynastiesVirtualTableProps {
  data: TableRowData[];
}

const DYNASTY_COLUMN_KEY = 'dynasty';
const OVERSCAN = 8;

/** 取单元格文本：changeMonth 列无对应数据，恒为 '-'；其余列 key 与 TableRowData 字段同名。 */
function getCellValue(row: TableRowData, key: string): string {
  if (key === 'changeMonth') return '-';
  return (row as unknown as Record<string, string>)[key] ?? '';
}

export function DynastiesVirtualTable({ data }: DynastiesVirtualTableProps) {
  const { screenWidth, isMobile, isSmallMobile } = useResponsive();
  const isClassic = useStyleStore((s) => s.style === 'classic');

  // 所有响应式/样式派生值只算一次
  const layout = useMemo(() => {
    const visible = getVisibleColumns(columns, { isMobile, isSmallMobile });
    const glass = buildGlassStyles(screenWidth, isClassic);
    const sizing = getRowSizing(isMobile);
    const rowHeight = getRowHeight(screenWidth);
    const headerHeight = getHeaderHeight(screenWidth);
    const fontSize = getTableStyles(screenWidth).fontSize;
    const gridTemplate = getGridTemplate(visible);

    // 表头单元格 sx（按列预生成稳定引用）
    const headerSxList: SxProps<Theme>[] = visible.map((col) => {
      const sticky = col.key === DYNASTY_COLUMN_KEY;
      return {
        ...glass.headerCell,
        px: 1,
        minWidth: 0,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontWeight: col.priority === 'high' ? 700 : 600,
        fontSize: `calc(${fontSize} * 0.9)`,
        lineHeight: `${headerHeight}px`,
        borderRight: col.isLast ? 'none' : `1px solid ${glass.cellBorderColor}`,
        ...(sticky && {
          position: 'sticky',
          left: 0,
          zIndex: 31,
          ...glass.stickyHeaderCell,
        }),
      };
    });

    // 行单元格 sx（按列预生成稳定引用）
    const cellSxList: SxProps<Theme>[] = visible.map((col) => {
      const sticky = col.key === DYNASTY_COLUMN_KEY;
      const base: Record<string, unknown> = {
        px: 1,
        minWidth: 0,
        fontSize,
        color: 'var(--color-text-primary)',
        borderRight: col.isLast ? 'none' : `1px solid ${glass.cellBorderColor}`,
      };
      if (sticky) {
        // 首列：flex 居中放 Typography
        Object.assign(base, {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'sticky',
          left: 0,
          zIndex: 2,
          ...glass.stickyBodyCell,
        });
      } else {
        // 其余列：块级 + 单行省略，lineHeight 垂直居中
        Object.assign(base, {
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: `${rowHeight}px`,
        });
      }
      return base as SxProps<Theme>;
    });

    // 行容器 sx：基础(网格/定位/宽) 合并斑马底色 + hover，预生成 even/odd 两个完整对象，
    // 渲染时按奇偶二选一（单对象引用稳定，且避免内联 style 设背景会覆盖 :hover 的问题）。
    const rowBase = {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      display: 'grid',
      gridTemplateColumns: gridTemplate,
      width: sizing.width,
      ...(sizing.minWidth ? { minWidth: sizing.minWidth } : {}),
      '&:hover': { backgroundColor: glass.rowHover },
    };
    const rowEvenSx: SxProps<Theme> = {
      ...rowBase,
      backgroundColor: glass.rowBgEven,
    };
    const rowOddSx: SxProps<Theme> = {
      ...rowBase,
      backgroundColor: glass.rowBg,
    };

    return {
      visible,
      glass,
      sizing,
      rowHeight,
      headerHeight,
      fontSize,
      gridTemplate,
      headerSxList,
      cellSxList,
      rowEvenSx,
      rowOddSx,
    };
  }, [screenWidth, isMobile, isSmallMobile, isClassic]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => layout.rowHeight,
    overscan: OVERSCAN,
  });

  // 响应式档位变化导致行高变化时，重算虚拟化尺寸
  useEffect(() => {
    virtualizer.measure();
  }, [layout.rowHeight, virtualizer]);

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <Box
      ref={scrollRef}
      sx={{
        height: '100%',
        minHeight: 0,
        position: 'relative',
        WebkitOverflowScrolling: 'touch',
        ...tableConfig.containerStyles, // overflow:auto + 毛玻璃外观
      }}
    >
      {/* 表头：滚动容器直接子节点，sticky top:0 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: layout.gridTemplate,
          width: layout.sizing.width,
          ...(layout.sizing.minWidth ? { minWidth: layout.sizing.minWidth } : {}),
          height: layout.headerHeight,
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        {layout.visible.map((col, ci) => (
          <Box key={col.key} component="div" sx={layout.headerSxList[ci]}>
            {isMobile && col.mobileLabel ? col.mobileLabel : col.label}
          </Box>
        ))}
      </Box>

      {/* 撑高占位层 */}
      <Box
        sx={{
          height: virtualizer.getTotalSize(),
          width: layout.sizing.width,
          ...(layout.sizing.minWidth ? { minWidth: layout.sizing.minWidth } : {}),
          position: 'relative',
        }}
      >
        {virtualItems.map((vItem) => {
          const row = data[vItem.index];
          if (!row) return null;
          const isEven = vItem.index % 2 === 0;
          const rowStyle: CSSProperties = {
            height: vItem.size,
            transform: `translateY(${vItem.start}px)`,
          };
          return (
            <Box
              key={row.id}
              sx={isEven ? layout.rowEvenSx : layout.rowOddSx}
              style={rowStyle}
            >
              {layout.visible.map((col, ci) => {
                const value = getCellValue(row, col.key);
                if (col.key === DYNASTY_COLUMN_KEY) {
                  return (
                    <Box key={col.key} sx={layout.cellSxList[ci]}>
                      <Typography sx={tableStyles.dynastyName}>{value}</Typography>
                    </Box>
                  );
                }
                return (
                  <Box key={col.key} sx={layout.cellSxList[ci]}>
                    {value}
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
