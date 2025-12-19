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
}

// 优化的统治者行组件
const RulerRow = memo(({ 
  ruler, 
  dynastyName, 
  subDynastyName, 
  yearName, 
  isFirstYearName, 
  rowSpan 
}: {
  ruler: Ruler;
  dynastyName: string;
  subDynastyName?: string | undefined;
  yearName?: YearName;
  isFirstYearName?: boolean;
  rowSpan?: number;
}) => (
  <TableRow hover sx={tableStyles.tableRow}>
    {/* 朝代列 */}
    {isFirstYearName && (
      <TableCell 
        sx={{ 
          ...tableStyles.dynastyCell,
          ...tableStyles.bodyCell,
          backgroundColor: '#f8f9fa'
        }}
        rowSpan={rowSpan}
      >
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {subDynastyName || dynastyName}
        </Typography>
      </TableCell>
    )}
    
    {/* 名号列 */}
    {isFirstYearName && (
      <TableCell 
        sx={{
          ...tableStyles.bodyCell,
          verticalAlign: 'top'
        }}
        rowSpan={rowSpan}
      >
        <span style={tableStyles.rulerTitle}>
          {ruler.title || <span style={{ color: '#999' }}>-</span>}
        </span>
      </TableCell>
    )}
    
    {/* 姓名列 */}
    {isFirstYearName && (
      <TableCell 
        sx={{
          ...tableStyles.bodyCell,
          verticalAlign: 'top'
        }}
        rowSpan={rowSpan}
      >
        {ruler.name || <span style={{ color: '#999' }}>-</span>}
      </TableCell>
    )}
    
    {/* 年号相关列 */}
    <TableCell sx={tableStyles.bodyCell}>
      {yearName ? (
        <>
          {yearName.name || <span style={{ color: '#999' }}>-</span>}
          {yearName.note && (
            <Typography variant="caption" sx={{ display: 'block', color: '#666', fontStyle: 'italic' }}>
              {yearName.note}
            </Typography>
          )}
        </>
      ) : (
        ruler.yearName || <span style={{ color: '#999' }}>-</span>
      )}
    </TableCell>
    
    <TableCell sx={tableStyles.bodyCell} align="center">
      {yearName?.duration || ruler.duration || <span style={{ color: '#999' }}>-</span>}
    </TableCell>
    
    <TableCell sx={tableStyles.bodyCell} align="center">
      {yearName?.ganZhi || ruler.ganZhi || <span style={{ color: '#999' }}>-</span>}
    </TableCell>
    
    <TableCell sx={tableStyles.bodyCell} align="center">
      {yearName?.changeMonth || ruler.changeMonth || <span style={{ color: '#999' }}>-</span>}
    </TableCell>
    
    <TableCell sx={tableStyles.bodyCell} align="center">
      <span style={tableStyles.startYear}>
        {yearName?.startYear || ruler.startYear || <span style={{ color: '#999' }}>-</span>}
      </span>
    </TableCell>
    
    {/* 大事记列 */}
    {isFirstYearName && (
      <TableCell 
        sx={{
          ...tableStyles.bodyCell,
          maxWidth: '400px',
          verticalAlign: 'top'
        }}
        rowSpan={rowSpan}
      >
        {ruler.events.length > 0 ? (
          <Box>
            {ruler.events.map((event, eventIndex) => (
              <Box key={eventIndex} sx={tableStyles.eventContainer}>
                <Typography variant="body2" sx={tableStyles.eventDescription}>
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
                      sx={tableStyles.mapIconButton}
                    >
                      <MapIcon sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        )}
      </TableCell>
    )}
  </TableRow>
));

RulerRow.displayName = 'RulerRow';

// 优化的朝代行组件
export const DynastyRow = memo(({ dynasty, isExpanded, onToggle }: DynastyRowProps) => {
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
          />
        );
      }
    });

    return rows;
  };

  const rows = [];

  // 朝代标题行（始终显示）
  const dynastyHeaderRow = (
    <TableRow key={`${dynasty.id}-header`} hover sx={tableStyles.dynastyHeaderRow}>
      <TableCell 
        sx={{ 
          ...tableStyles.dynastyCell,
          ...tableStyles.bodyCell,
          ...tableStyles.dynastyHeaderCell
        }}
        onClick={handleToggle}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{
              ...tableStyles.dynastyName,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              {dynasty.name}
            </Typography>
            <Typography variant="caption" sx={tableStyles.dynastyPeriod}>
              {dynasty.period}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: '#1976d2',
            fontSize: '0.8rem'
          }}>
            <ExpandLessIcon 
              sx={{ 
                ...tableStyles.expandIcon,
                transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                fontSize: '1.2rem'
              }}
            />
          </Box>
        </Box>
      </TableCell>
      <TableCell 
        colSpan={8} 
        sx={{ 
          ...tableStyles.bodyCell, 
          fontStyle: 'italic', 
          color: '#666',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: '#f0f0f0'
          }
        }}
        onClick={handleToggle}
      >
        {dynasty.summary && (
          <Typography variant="body2" sx={{ 
            fontStyle: 'normal',
            color: '#555',
            lineHeight: 1.4,
            mb: 0.5
          }}>
            {dynasty.summary}
          </Typography>
        )}
        {dynasty.note && (
          <Typography variant="body2" sx={{ 
            fontStyle: 'italic',
            color: '#777',
            fontSize: '0.85rem'
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