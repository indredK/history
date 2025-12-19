import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
  IconButton,
  Tooltip
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { 
  columns, 
  tableStyles, 
  tableConfig, 
  loadingConfig,
  type ColumnConfig 
} from './config';

interface Event {
  description: string;
  mapUrl?: string;
}

interface Ruler {
  title: string;
  name: string;
  yearName: string;
  duration: string;
  ganZhi: string;
  changeMonth: string;
  startYear: string;
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
  rulers?: Ruler[];
  subDynasties?: SubDynasty[];
}

interface DynastiesData {
  title: string;
  subtitle: string;
  dynasties: Dynasty[];
}



export function DynastiesList() {
  const [data, setData] = useState<DynastiesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/json/chinese-dynasties.json');
        if (!response.ok) {
          throw new Error('Failed to load dynasties data');
        }
        const dynastiesData = await response.json();
        setData(dynastiesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);



  if (loading) {
    return (
      <Box sx={{ height: loadingConfig.containerHeight, ...loadingConfig.containerStyles }}>
        <LoadingSkeleton />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ height: loadingConfig.containerHeight, ...loadingConfig.containerStyles }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h6">
            加载失败: {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  // 渲染单元格内容
  const renderCellContent = (column: ColumnConfig, ruler: Ruler): React.ReactNode => {
    const value = ruler[column.key as keyof Ruler] as string;
    
    switch (column.key) {
      case 'title':
        return (
          <span style={tableStyles.rulerTitle}>
            {value || <span style={{ color: '#999' }}>-</span>}
          </span>
        );
      case 'startYear':
        return (
          <span style={tableStyles.startYear}>
            {value || <span style={{ color: '#999' }}>-</span>}
          </span>
        );
      case 'events':
        return ruler.events.length > 0 ? (
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
        );
      default:
        return value || <span style={{ color: '#999' }}>-</span>;
    }
  };

  const renderRulerRows = (rulers: Ruler[], dynastyName: string, dynastyPeriod: string, subDynastyName?: string) => {
    return rulers.map((ruler, index) => (
      <TableRow 
        key={`${dynastyName}-${subDynastyName || ''}-${index}`} 
        hover
        sx={tableStyles.tableRow}
      >
        {columns.map((column) => {
          if (column.key === 'dynasty') {
            return (
              <TableCell 
                key={column.key}
                sx={{ 
                  ...tableStyles.dynastyCell,
                  ...tableStyles.bodyCell,
                  backgroundColor: index === 0 ? '#e8f5e8' : 'inherit'
                }}
                rowSpan={index === 0 ? rulers.length : undefined}
              >
                {index === 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={tableStyles.dynastyName}>
                      {subDynastyName || dynastyName}
                    </Typography>
                    <Typography variant="caption" sx={tableStyles.dynastyPeriod}>
                      {dynastyPeriod}
                    </Typography>
                  </Box>
                )}
              </TableCell>
            );
          }
          
          return (
            <TableCell 
              key={column.key}
              align={column.align || 'left'}
              sx={{
                ...tableStyles.bodyCell,
                ...(column.minWidth && { minWidth: column.minWidth }),
                ...(column.key === 'events' && { maxWidth: '400px' })
              }}
            >
              {renderCellContent(column, ruler)}
            </TableCell>
          );
        })}
      </TableRow>
    ));
  };

  const renderDynastyRows = (dynasty: Dynasty) => {
    const rows = [];

    if (dynasty.subDynasties) {
      dynasty.subDynasties.forEach(subDynasty => {
        if (subDynasty.dynasties) {
          // Handle nested dynasties (like 南朝 with 宋齐梁陈)
          subDynasty.dynasties.forEach(nestedDynasty => {
            if (nestedDynasty.rulers) {
              rows.push(...renderRulerRows(nestedDynasty.rulers, dynasty.name, nestedDynasty.period, `${subDynasty.name}-${nestedDynasty.name}`));
            }
          });
        } else if (subDynasty.rulers) {
          rows.push(...renderRulerRows(subDynasty.rulers, dynasty.name, subDynasty.period, subDynasty.name));
        }
      });
    } else if (dynasty.rulers) {
      rows.push(...renderRulerRows(dynasty.rulers, dynasty.name, dynasty.period));
    } else if (dynasty.note) {
      // For dynasties with only notes, show a single row
      rows.push(
        <TableRow key={dynasty.id} hover>
          <TableCell sx={{ 
            ...tableStyles.dynastyCell,
            ...tableStyles.bodyCell,
            backgroundColor: '#e8f5e8'
          }}>
            <Box>
              <Typography variant="subtitle2" sx={tableStyles.dynastyName}>
                {dynasty.name}
              </Typography>
              <Typography variant="caption" sx={tableStyles.dynastyPeriod}>
                {dynasty.period}
              </Typography>
            </Box>
          </TableCell>
          <TableCell colSpan={8} sx={{ ...tableStyles.bodyCell, fontStyle: 'italic', color: '#666' }}>
            {dynasty.note}
          </TableCell>
        </TableRow>
      );
    }

    return rows;
  };

  return (
    <Box sx={{ p: 1 }}>
      <TableContainer 
        component={Paper} 
        sx={{ 
          height: tableConfig.containerHeight,
          ...tableConfig.containerStyles
        }}
      >
        <Table sx={{ minWidth: tableConfig.minWidth }} stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column.key}
                  sx={{
                    ...tableStyles.headerCell,
                    ...(column.width && { width: column.width }),
                    ...(column.minWidth && { minWidth: column.minWidth }),
                    borderRight: column.isLast ? 'none' : '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.dynasties.map(dynasty => renderDynastyRows(dynasty))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}