import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
} from '@mui/material';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { MobileTableContainer } from '@/components/ui/MobileTableContainer';
import {
  ResponsiveTable,
  ResponsiveTableHead,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableCell,
} from '@/components/ui/ResponsiveTable';
import { useResponsive } from '@/hooks/useResponsive';
import { useDynastiesExpanded } from '@/stores/dynastiesStore';
import { DynastyRow } from './DynastyRow';
import { loadJsonData } from '@/utils/dataLoaders';
import { 
  columns, 
  tableStyles, 
  tableConfig
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
  const { isMobile, isSmallMobile } = useResponsive();
  
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
        const config = await loadJsonData<DynastiesConfig>('/data/json/chinese-dynasties.json');
        
        // 确保config不为空
        if (!config) {
          throw new Error('Failed to load dynasties config');
        }

        // 2. 检查是否使用新的数据源结构
        if (config.dataSource === 'dynasties' && config.dynasties[0]?.dataFile) {
          // 新结构：动态加载各个朝代文件
          const dynastiesData: Dynasty[] = [];
          
          for (const dynastyConfig of config.dynasties) {
            try {
              const dynastyData = await loadJsonData<Dynasty>(`/data/json/${dynastyConfig.dataFile}`);
              if (dynastyData) {
                dynastiesData.push(dynastyData);
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
      <Box sx={{ 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4
      }}>
        <LoadingSkeleton />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4
      }}>
        <Paper sx={{ 
          p: 4, 
          textAlign: 'center',
          backdropFilter: 'blur(var(--glass-blur-medium, 20px))',
          WebkitBackdropFilter: 'blur(var(--glass-blur-medium, 20px))',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: 'var(--glass-radius-lg, 16px)',
          boxShadow: 'var(--glass-shadow-md, 0 4px 16px rgba(0, 0, 0, 0.12))'
        }}>
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
    <Box sx={{ 
      height: '100%', // 使用100%高度占满父容器
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      p: isMobile ? 0.5 : 1,
      // 竖屏模式下移除内边距，让内容更贴近边缘
      ...(isMobile && {
        p: 0.25,
      })
    }}>
      <MobileTableContainer
        height="100%" // 使用100%高度
        showScrollIndicator={isMobile}
        showSwipeHint={isMobile}
      >
        <ResponsiveTable minWidth={tableConfig.minWidth}>
          <ResponsiveTableHead>
            <ResponsiveTableRow>
              {columns.map((column) => (
                <ResponsiveTableCell
                  key={column.key}
                  component="th"
                  sticky={column.key === 'dynasty'}
                  hideOnSmallMobile={column.hideOnSmallMobile || false}
                  hideOnMobile={column.hideOnMobile || false}
                  priority={column.priority || 'medium'}
                  minWidth={column.minWidth || undefined}
                  sx={{
                    ...tableStyles.headerCell,
                    ...(column.width && { width: column.width }),
                    borderRight: column.isLast ? 'none' : '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {isMobile && column.mobileLabel ? column.mobileLabel : column.label}
                </ResponsiveTableCell>
              ))}
            </ResponsiveTableRow>
          </ResponsiveTableHead>
          <ResponsiveTableBody>
            {data.dynasties.map(dynasty => (
              <DynastyRow
                key={dynasty.id}
                dynasty={dynasty}
                isExpanded={isDynastyExpanded(dynasty.id)}
                onToggle={handleToggleDynasty}
                isMobile={isMobile}
                isSmallMobile={isSmallMobile}
              />
            ))}
          </ResponsiveTableBody>
        </ResponsiveTable>
      </MobileTableContainer>
    </Box>
  );
}