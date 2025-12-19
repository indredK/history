import { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useDynastiesExpanded } from '@/stores/dynastiesStore';
import { DynastyRow } from './DynastyRow';
import { 
  columns, 
  tableStyles, 
  tableConfig, 
  loadingConfig
} from './config';

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

interface DynastiesConfig {
  title: string;
  subtitle: string;
  dataSource: string;
  dynasties: {
    id: string;
    name: string;
    period: string;
    dataFile: string;
  }[];
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
  
  // 朝代展开状态管理
  const {
    isDynastyExpanded,
    toggleDynasty,
    setDynastyIds
  } = useDynastiesExpanded();

  // 优化的切换处理函数
  const handleToggleDynasty = useCallback((dynastyId: string) => {
    toggleDynasty(dynastyId);
  }, [toggleDynasty]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. 加载主配置文件
        const configResponse = await fetch('/data/json/chinese-dynasties.json');
        if (!configResponse.ok) {
          throw new Error('Failed to load dynasties config');
        }
        const config: DynastiesConfig = await configResponse.json();

        // 2. 检查是否使用新的数据源结构
        if (config.dataSource === 'dynasties' && config.dynasties[0]?.dataFile) {
          // 新结构：动态加载各个朝代文件
          const dynastiesData: Dynasty[] = [];
          
          for (const dynastyConfig of config.dynasties) {
            try {
              const dynastyResponse = await fetch(`/data/json/${dynastyConfig.dataFile}`);
              if (dynastyResponse.ok) {
                const dynastyData = await dynastyResponse.json();
                dynastiesData.push(dynastyData);
              } else {
                console.warn(`Failed to load dynasty data: ${dynastyConfig.dataFile}`);
                // 如果单个文件加载失败，创建一个基本的朝代对象
                dynastiesData.push({
                  id: dynastyConfig.id,
                  name: dynastyConfig.name,
                  period: dynastyConfig.period,
                  note: `数据文件 ${dynastyConfig.dataFile} 加载失败`
                });
              }
            } catch (err) {
              console.warn(`Error loading dynasty data: ${dynastyConfig.dataFile}`, err);
              dynastiesData.push({
                id: dynastyConfig.id,
                name: dynastyConfig.name,
                period: dynastyConfig.period,
                note: `数据文件加载出错`
              });
            }
          }

          // 更新store中的朝代ID列表
          const dynastyIds = dynastiesData.map(dynasty => dynasty.id);
          setDynastyIds(dynastyIds);

          setData({
            title: config.title,
            subtitle: config.subtitle,
            dynasties: dynastiesData
          });
        } else {
          // 旧结构：直接使用配置文件中的数据
          const dynastiesData = config as DynastiesData;
          
          // 更新store中的朝代ID列表
          const dynastyIds = dynastiesData.dynasties.map(dynasty => dynasty.id);
          setDynastyIds(dynastyIds);
          
          setData(dynastiesData);
        }
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
            {data.dynasties.map(dynasty => (
              <DynastyRow
                key={dynasty.id}
                dynasty={dynasty}
                isExpanded={isDynastyExpanded(dynasty.id)}
                onToggle={handleToggleDynasty}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}