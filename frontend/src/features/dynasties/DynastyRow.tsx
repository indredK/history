import React, { memo } from 'react';
import {
  Box,
  Typography,
  TableRow,
  TableCell,
  Link,
  IconButton,
  Tooltip,
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { tableStyles } from './config';

interface Event {
  description: string;
  mapUrl?: string;
}

interface YearName {
  name: string;
  duration: string;
  ganZhi: string;
  changeMonth: string;
  startYear: string;
  note?: string;
}

interface Ruler {
  title: string;
  name: string;
  yearName?: string;
  yearNames?: YearName[];
  duration?: string;
  ganZhi?: string;
  changeMonth?: string;
  startYear?: string;
  events: Event[];
}

interface SubDynasty {
  id: string;
  name: string;
  period: string;
  rulers?: Ruler[];
  dynasties?: SubDynasty[];
}

interface Dynasty {
  id: string;
  name: string;
  period: string;
  note?: string;
  summary?: string;
  rulers?: Ruler[];
  subDynasties?: SubDynasty[];
}

interface DynastyRowProps {
  dynasty: Dynasty;
  isExpanded: boolean;
  onToggle: (dynastyId: string) => void;
  isMobile?: boolean;
  isSmallMobile?: boolean;
}

// 优化的统治者行组件
const RulerRow = memo(({ 
  ruler, 
  dynastyName, 
  subDynastyName, 
  yearName, 
  isFirstYearName, 
  rowSpan,
  isMobile,
  isSmallMobile
}: {
  ruler: Ruler;
  dynastyName: string;
  subDynastyName?: string | undefined;
  yearName?: YearName;
  isFirstYearName?: boolean;
  rowSpan?: number;
  isMobile?: boolean | undefined;
  isSmallMobile?: boolean | undefined;
}) => (
  <TableRow hover sx={tableStyles.tableRow}>
    {/* 朝代列 - 移动端固定，毛玻璃效果 */}
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
          })
        }}
        rowSpan={rowSpan}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 'medium',
            fontSize: 'inherit',
            lineHeight: 1.2,
            wordBreak: 'break-all'
          }}
        >
          {subDynastyName || dynastyName}
        </Typography>
      </TableCell>
    )}
    
    {/* 名号列 - 小屏手机隐藏 */}
    {!isSmallMobile && isFirstYearName && (
      <TableCell 
        sx={{
          ...tableStyles.bodyCell,
          verticalAlign: 'top',
          ...(isMobile && {
            fontSize: '0.7rem',
            padding: '6px 8px',
          })
        }}
        rowSpan={rowSpan}
      >
        <span style={tableStyles.rulerTitle}>
          {ruler.title || <span style={{ color: 'var(--color-text-muted)' }}>-</span>}
        </span>
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
          })
        }}
        rowSpan={rowSpan}
      >
        {ruler.name || <span style={{ color: 'var(--color-text-muted)' }}>-</span>}
      </TableCell>
    )}
    
    {/* 年号列 - 小屏手机隐藏 */}
    {!isSmallMobile && (
      <TableCell sx={{
        ...tableStyles.bodyCell,
        ...(isMobile && {
          fontSize: '0.7rem',
          padding: '6px 8px',
        })
      }}>
        {yearName ? (
          <>
            {yearName.name || <span style={{ color: 'var(--color-text-muted)' }}>-</span>}
            {yearName.note && (
              <Typography variant="caption" sx={{ 
                display: 'block', 
                color: 'var(--color-text-secondary)', 
                fontStyle: 'italic',
                fontSize: isMobile ? '0.6rem' : 'inherit'
              }}>
                {yearName.note}
              </Typography>
            )}
          </>
        ) : (
          ruler.yearName || <span style={{ color: 'var(--color-text-muted)' }}>-</span>
        )}
      </TableCell>
    )}
    
    {/* 使用年数列 - 移动端隐藏 */}
    {!isMobile && (
      <TableCell sx={tableStyles.bodyCell} align="center">
        {yearName?.duration || ruler.duration || <span style={{ color: 'var(--color-text-muted)' }}>-</span>}
      </TableCell>
    )}
    
    {/* 元年干支列 - 移动端隐藏 */}
    {!isMobile && (
      <TableCell sx={tableStyles.bodyCell} align="center">
        {yearName?.ganZhi || ruler.ganZhi || <span style={{ color: 'var(--color-text-muted)' }}>-</span>}
      </TableCell>
    )}
    
    {/* 改元月份列 - 移动端隐藏 */}
    {!isMobile && (
      <TableCell sx={tableStyles.bodyCell} align="center">
        {yearName?.changeMonth || ruler.changeMonth || <span style={{ color: 'var(--color-text-muted)' }}>-</span>}
      </TableCell>
    )}
    
    {/* 公元纪年列 */}
    <TableCell sx={{
      ...tableStyles.bodyCell,
      ...(isMobile && {
        fontSize: isSmallMobile ? '0.65rem' : '0.7rem',
        padding: isSmallMobile ? '4px 3px' : '6px 8px',
        minWidth: isSmallMobile ? '60px' : '80px',
      })
    }} align="center">
      <span style={tableStyles.startYear}>
        {yearName?.startYear || ruler.startYear || <span style={{ color: 'var(--color-text-muted)' }}>-</span>}
      </span>
    </TableCell>
    
    {/* 大事记列 */}
    {isFirstYearName && (
      <TableCell 
        sx={{
          ...tableStyles.bodyCell,
          maxWidth: isMobile ? '200px' : '400px',
          verticalAlign: 'top',
          ...(isMobile && {
            fontSize: isSmallMobile ? '0.6rem' : '0.7rem',
            padding: isSmallMobile ? '4px 3px' : '6px 8px',
            lineHeight: 1.2,
          })
        }}
        rowSpan={rowSpan}
      >
        {ruler.events.length > 0 ? (
          <Box>
            {ruler.events.map((event, eventIndex) => (
              <Box key={eventIndex} sx={{
                ...tableStyles.eventContainer,
                ...(isMobile && {
                  marginBottom: '4px',
                  gap: '4px',
                })
              }}>
                <Typography variant="body2" sx={{
                  ...tableStyles.eventDescription,
                  fontSize: 'inherit',
                  lineHeight: 1.2,
                }}>
                  • {event.description}
                </Typography>
                {event.mapUrl && (
                  <Tooltip title="查看历史地图" arrow>
                    <IconButton
                      size="small"
                      component={Link}
                      href={event.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        ...tableStyles.mapIconButton,
                        ...(isMobile && {
                          width: isSmallMobile ? 20 : 24,
                          height: isSmallMobile ? 20 : 24,
                          padding: '2px',
                        })
                      }}
                    >
                      <MapIcon sx={{ 
                        fontSize: isMobile ? (isSmallMobile ? '0.7rem' : '0.8rem') : '0.9rem' 
                      }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <span style={{ color: 'var(--color-text-muted)' }}>-</span>
        )}
      </TableCell>
    )}
  </TableRow>
));

RulerRow.displayName = 'RulerRow';

// 优化的朝代行组件
export const DynastyRow = memo(({ dynasty, isExpanded, onToggle, isMobile, isSmallMobile }: DynastyRowProps) => {
  const handleToggle = () => {
    onToggle(dynasty.id);
  };

  // 渲染统治者行
  const renderRulerRows = (rulers: Ruler[], dynastyName: string, subDynastyName?: string) => {
    const rows: React.ReactNode[] = [];

    rulers.forEach((ruler, rulerIndex) => {
      if (ruler.yearNames && ruler.yearNames.length > 0) {
        // 处理有多个年号的统治者
        ruler.yearNames.forEach((yearName, yearIndex) => {
          const isFirstYearName = yearIndex === 0;
          
          rows.push(
            <RulerRow
              key={`${dynastyName}-${subDynastyName || ''}-${rulerIndex}-${yearIndex}`}
              ruler={ruler}
              dynastyName={dynastyName}
              subDynastyName={subDynastyName}
              yearName={yearName}
              isFirstYearName={isFirstYearName}
              rowSpan={ruler.yearNames!.length}
              isMobile={isMobile}
              isSmallMobile={isSmallMobile}
            />
          );
        });
      } else {
        // 处理只有单个年号或没有年号的统治者
        rows.push(
          <RulerRow
            key={`${dynastyName}-${subDynastyName || ''}-${rulerIndex}`}
            ruler={ruler}
            dynastyName={dynastyName}
            subDynastyName={subDynastyName}
            isFirstYearName={true}
            rowSpan={1}
            isMobile={isMobile}
            isSmallMobile={isSmallMobile}
          />
        );
      }
    });

    return rows;
  };

  const rows = [];

  // 计算朝代标题行的列数
  const getColSpan = () => {
    if (isSmallMobile) return 4; // 朝代、姓名、纪年、大事记
    if (isMobile) return 5; // 朝代、名号、姓名、纪年、大事记
    return 8; // 桌面端全部列
  };

  // 朝代标题行（始终显示）
  const dynastyHeaderRow = (
    <TableRow key={`${dynasty.id}-header`} hover sx={tableStyles.dynastyHeaderRow}>
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
          })
        }}
        onClick={handleToggle}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{
              ...tableStyles.dynastyName,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: 'inherit',
              lineHeight: 1.2,
              wordBreak: 'break-all'
            }}>
              {dynasty.name}
            </Typography>
            <Typography variant="caption" sx={{
              ...tableStyles.dynastyPeriod,
              fontSize: isMobile ? (isSmallMobile ? '0.55rem' : '0.6rem') : 'inherit',
              lineHeight: 1.1
            }}>
              {dynasty.period}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: 'var(--color-primary)',
            fontSize: '0.8rem'
          }}>
            <ExpandLessIcon 
              sx={{ 
                ...tableStyles.expandIcon,
                transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                fontSize: isMobile ? (isSmallMobile ? '1rem' : '1.1rem') : '1.2rem'
              }}
            />
          </Box>
        </Box>
      </TableCell>
      <TableCell 
        colSpan={getColSpan()} 
        sx={{ 
          ...tableStyles.bodyCell, 
          fontStyle: 'italic', 
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          backgroundColor: 'var(--theme-glass-bg-light)',
          transition: 'all var(--glass-duration-normal, 250ms) var(--glass-easing, cubic-bezier(0.4, 0, 0.2, 1))',
          '&:hover': {
            backgroundColor: 'var(--theme-glass-bg)',
            boxShadow: 'var(--theme-shadow-sm)'
          },
          ...(isMobile && {
            fontSize: isSmallMobile ? '0.6rem' : '0.7rem',
            padding: isSmallMobile ? '4px 3px' : '6px 8px',
            lineHeight: 1.2,
          })
        }}
        onClick={handleToggle}
      >
        {dynasty.summary && (
          <Typography variant="body2" sx={{ 
            fontStyle: 'normal',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.4,
            mb: 0.5,
            fontSize: 'inherit'
          }}>
            {dynasty.summary}
          </Typography>
        )}
        {dynasty.note && (
          <Typography variant="body2" sx={{ 
            fontStyle: 'italic',
            color: 'var(--color-text-tertiary)',
            fontSize: isMobile ? (isSmallMobile ? '0.55rem' : '0.65rem') : '0.85rem'
          }}>
            {dynasty.note}
          </Typography>
        )}
      </TableCell>
    </TableRow>
  );

  rows.push(dynastyHeaderRow);

  // 朝代详细内容（可收起/展开）
  if (isExpanded) {
    const contentRows = [];

    // 处理五代特殊结构：dynasties 数组
    if ((dynasty as any).dynasties) {
      (dynasty as any).dynasties.forEach((subDynasty: SubDynasty) => {
        if (subDynasty.rulers) {
          contentRows.push(...renderRulerRows(subDynasty.rulers, dynasty.name, subDynasty.name));
        }
      });
    }
    // 处理南朝北朝结构：subDynasties 数组
    else if (dynasty.subDynasties) {
      dynasty.subDynasties.forEach(subDynasty => {
        if (subDynasty.dynasties) {
          // Handle nested dynasties (like 南朝 with 宋齐梁陈)
          subDynasty.dynasties.forEach(nestedDynasty => {
            if (nestedDynasty.rulers) {
              contentRows.push(...renderRulerRows(nestedDynasty.rulers, dynasty.name, `${subDynasty.name}-${nestedDynasty.name}`));
            }
          });
        } else if (subDynasty.rulers) {
          contentRows.push(...renderRulerRows(subDynasty.rulers, dynasty.name, subDynasty.name));
        }
      });
    } 
    // 处理普通朝代结构：直接有 rulers
    else if (dynasty.rulers) {
      contentRows.push(...renderRulerRows(dynasty.rulers, dynasty.name));
    }

    rows.push(...contentRows);
  }

  return rows;
});

DynastyRow.displayName = 'DynastyRow';