/**
 * 响应式表格组件
 * 根据屏幕尺寸自动调整表格布局和显示方式
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useResponsive } from '@/hooks/useResponsive';
import { getTableStyles } from '@/config/responsive';

interface ResponsiveTableProps {
  children: React.ReactNode;
  stickyHeader?: boolean;
  size?: 'small' | 'medium';
  minWidth?: number | string;
  className?: string;
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
  priority?: 'high' | 'medium' | 'low'; // 新增优先级属性
  [key: string]: any;
}

export function ResponsiveTable({
  children,
  stickyHeader = true,
  size = 'small',
  minWidth = 650,
  className = '',
  ...props
}: ResponsiveTableProps) {
  const { isMobile, isSmallMobile, screenWidth } = useResponsive();
  const tableStyles = getTableStyles(screenWidth);

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
          borderRight: '1px solid rgba(255,255,255,0.1)',
          
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
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 100,
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
  className = '',
  ...props
}: ResponsiveTableCellProps) {
  const { isMobile, isSmallMobile } = useResponsive();
  
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

  return (
    <TableCell
      component={component}
      align={align}
      sx={{
        // 粘性定位
        ...(sticky && {
          position: 'sticky',
          left: 0,
          backgroundColor: component === 'th' 
            ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
            : 'var(--color-bg-card)',
          zIndex: component === 'th' ? 101 : 10,
          borderRight: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
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
            backgroundColor: component === 'th' 
              ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
              : 'var(--color-bg-card)',
            zIndex: component === 'th' ? 101 : 10,
            minWidth: isSmallMobile ? '60px' : '80px',
            maxWidth: isSmallMobile ? '80px' : '120px',
            boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
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

// 导出便捷组件
export const ResponsiveTableContainer = TableContainer;
export const ResponsiveTableHead = TableHead;
export const ResponsiveTableBody = TableBody;
export const ResponsiveTableRow = TableRow;