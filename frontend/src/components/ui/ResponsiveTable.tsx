/**
 * 响应式表格组件
 * 根据屏幕尺寸自动调整表格布局和显示方式
 * 
 * 应用苹果毛玻璃风格（Glassmorphism）
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useResponsive } from '@/hooks/useResponsive';
import { getTableStyles } from '@/config/responsive';
import { getGlassConfig } from '@/config/glassConfig';

interface ResponsiveTableProps {
  children: React.ReactNode;
  stickyHeader?: boolean;
  size?: 'small' | 'medium';
  minWidth?: number | string;
  className?: string;
  glassEffect?: boolean;
}

interface ResponsiveTableCellProps {
  children: React.ReactNode;
  component?: 'th' | 'td';
  sticky?: boolean;
  hideOnMobile?: boolean;
  hideOnSmallMobile?: boolean;
  minWidth?: number | string | undefined;
  maxWidth?: number | string | undefined;
  align?: 'left' | 'center' | 'right';
  className?: string;
  priority?: 'high' | 'medium' | 'low';
  glassEffect?: boolean;
  [key: string]: any;
}

export function ResponsiveTable({
  children,
  stickyHeader = true,
  size = 'small',
  minWidth = 650,
  className = '',
  glassEffect = true,
  ...props
}: ResponsiveTableProps) {
  const { isMobile, isSmallMobile, screenWidth } = useResponsive();
  const tableStyles = getTableStyles(screenWidth);
  
  // 获取毛玻璃配置
  const glassConfig = getGlassConfig(screenWidth);
  const tableConfig = glassConfig.components.table;

  // 毛玻璃表头样式
  const glassHeaderStyles = glassEffect ? {
    backdropFilter: `blur(${tableConfig.header.blur})`,
    WebkitBackdropFilter: `blur(${tableConfig.header.blur})`,
    backgroundColor: `rgba(25, 118, 210, ${tableConfig.header.bgOpacity})`,
    borderBottom: `${glassConfig.border.width} solid ${glassConfig.border.color}`,
  } : {
    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
  };

  // 毛玻璃行样式
  const glassRowStyles = glassEffect ? {
    backgroundColor: `rgba(255, 255, 255, ${tableConfig.row.bgOpacity})`,
    transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`,
    '&:hover': {
      backgroundColor: `rgba(255, 255, 255, ${tableConfig.row.hoverOpacity})`,
    },
  } : {};

  return (
    <Table
      stickyHeader={stickyHeader}
      size={isMobile ? 'small' : size}
      sx={{
        minWidth: isMobile ? '100%' : minWidth,
        
        // 响应式字体和间距
        fontSize: tableStyles.fontSize,
        
        '& .MuiTableCell-root': {
          padding: tableStyles.cellPadding,
          fontSize: tableStyles.fontSize,
          lineHeight: 1.2,
          borderRight: `1px solid ${glassEffect ? glassConfig.border.color : 'rgba(255,255,255,0.1)'}`,
          
          // 移动端优化
          ...(isMobile && {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }),
        },
        
        '& .MuiTableHead-root .MuiTableCell-root': {
          padding: tableStyles.cellPadding,
          fontSize: `calc(${tableStyles.fontSize} * 0.9)`,
          fontWeight: 600,
          height: tableStyles.headerHeight,
          whiteSpace: 'nowrap',
          color: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          ...glassHeaderStyles,
        },
        
        '& .MuiTableBody-root .MuiTableRow-root': {
          ...glassRowStyles,
        },
        
        // 小屏设备进一步优化
        ...(isSmallMobile && {
          '& .MuiTableCell-root': {
            padding: '2px 4px',
            fontSize: '0.6rem',
          },
          '& .MuiTableHead-root .MuiTableCell-root': {
            padding: '4px 6px',
            fontSize: '0.55rem',
            height: '28px',
          },
        }),
      }}
      className={className}
      {...props}
    >
      {children}
    </Table>
  );
}

export function ResponsiveTableCell({
  children,
  component = 'td',
  sticky = false,
  hideOnMobile = false,
  hideOnSmallMobile = false,
  minWidth,
  maxWidth,
  align = 'left',
  priority = 'medium',
  glassEffect = true,
  className = '',
  ...props
}: ResponsiveTableCellProps) {
  const { isMobile, isSmallMobile, screenWidth } = useResponsive();
  
  // 获取毛玻璃配置
  const glassConfig = getGlassConfig(screenWidth);
  const tableConfig = glassConfig.components.table;
  
  // 根据优先级和设备类型决定是否隐藏
  const shouldHide = () => {
    if (hideOnSmallMobile && isSmallMobile) return true;
    if (hideOnMobile && isMobile) return true;
    
    // 根据优先级自动隐藏
    if (isSmallMobile && priority === 'low') return true;
    if (isMobile && priority === 'low') return true;
    
    return false;
  };
  
  if (shouldHide()) {
    return null;
  }

  // 毛玻璃粘性单元格样式
  const glassStickyStyles = glassEffect && sticky ? {
    backdropFilter: `blur(${tableConfig.container.blur})`,
    WebkitBackdropFilter: `blur(${tableConfig.container.blur})`,
    backgroundColor: component === 'th' 
      ? `rgba(25, 118, 210, ${tableConfig.header.bgOpacity})`
      : `rgba(30, 30, 30, ${tableConfig.container.bgOpacity})`,
    borderRight: `1px solid ${glassConfig.border.color}`,
    boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
  } : {};

  return (
    <TableCell
      component={component}
      align={align}
      sx={{
        // 粘性定位
        ...(sticky && {
          position: 'sticky',
          left: 0,
          zIndex: component === 'th' ? 101 : 10,
          ...glassStickyStyles,
          ...(!glassEffect && {
            backgroundColor: component === 'th' 
              ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
              : 'var(--color-bg-card)',
            borderRight: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
          }),
        }),
        
        // 宽度控制
        ...(minWidth && { minWidth }),
        ...(maxWidth && { maxWidth }),
        
        // 移动端特殊样式
        ...(isMobile && {
          // 第一列（通常是名称列）的特殊处理
          '&:first-of-type': {
            position: 'sticky',
            left: 0,
            zIndex: component === 'th' ? 101 : 10,
            minWidth: isSmallMobile ? '60px' : '80px',
            maxWidth: isSmallMobile ? '80px' : '120px',
            ...(glassEffect ? {
              backdropFilter: `blur(${tableConfig.container.blur})`,
              WebkitBackdropFilter: `blur(${tableConfig.container.blur})`,
              backgroundColor: component === 'th' 
                ? `rgba(25, 118, 210, ${tableConfig.header.bgOpacity})`
                : `rgba(30, 30, 30, ${tableConfig.container.bgOpacity})`,
              boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
            } : {
              backgroundColor: component === 'th' 
                ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
                : 'var(--color-bg-card)',
              boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
            }),
          },
        }),
        
        // 优先级样式
        ...(priority === 'high' && {
          fontWeight: component === 'th' ? 700 : 600,
        }),
        
        ...(priority === 'low' && {
          opacity: 0.8,
          fontSize: '0.9em',
        }),
      }}
      className={className}
      {...props}
    >
      {children}
    </TableCell>
  );
}

// 毛玻璃表格容器组件
interface GlassTableContainerProps {
  children: React.ReactNode;
  maxHeight?: number | string;
  className?: string;
  glassEffect?: boolean;
}

export function GlassTableContainer({
  children,
  maxHeight = 'calc(100vh - 200px)',
  className = '',
  glassEffect = true,
}: GlassTableContainerProps) {
  const { screenWidth } = useResponsive();
  const glassConfig = getGlassConfig(screenWidth);
  const tableConfig = glassConfig.components.table;

  const glassStyles = glassEffect ? {
    backdropFilter: `blur(${tableConfig.container.blur})`,
    WebkitBackdropFilter: `blur(${tableConfig.container.blur})`,
    backgroundColor: `rgba(30, 30, 30, ${tableConfig.container.bgOpacity})`,
    border: `${glassConfig.border.width} solid ${glassConfig.border.color}`,
    borderRadius: glassConfig.border.radius.lg,
    boxShadow: glassConfig.shadow.md,
  } : {};

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight,
        overflow: 'auto',
        ...glassStyles,
        ...(!glassEffect && {
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: '8px',
        }),
      }}
      className={className}
    >
      {children}
    </TableContainer>
  );
}

// 导出便捷组件
export const ResponsiveTableContainer = TableContainer;
export const ResponsiveTableHead = TableHead;
export const ResponsiveTableBody = TableBody;
export const ResponsiveTableRow = TableRow;