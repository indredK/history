import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
} from '@mui/material';
import { PagePanel } from '@/components/common';
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
import { loadJsonData } from '@/utils/services/dataLoaders';
import {
  columns,
  tableStyles,
  tableConfig
} from './config';
import { ApiResponse, TableRowData } from './types';

export function DynastiesListFlat() {
  const [data, setData] = useState<TableRowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isMobile, isSmallMobile } = useResponsive();

  useEffect(() => {
    const loadData = async () => {
      try {
        const allData: TableRowData[] = [];

        // 加载response1-9.json文件
        for (let i = 1; i <= 9; i++) {
          try {
            const response = await loadJsonData<ApiResponse>(`/data/json/response${i}.json`);

            if (response && response.yearRows) {
              // 将API数据转换为表格数据
              const tableRows: TableRowData[] = response.yearRows.map(row => ({
                id: row.id,
                dynasty: row.polity,
                title: row.rulerAlias,
                name: row.ruler,
                yearName: row.eraFullName,
                duration: row.eraYearNo,
                ganZhi: row.sexagenary,
                startYear: row.year.toString(),
              }));

              allData.push(...tableRows);
            }
          } catch (err) {
            console.warn(`Error loading response${i}.json:`, err);
          }
        }

        if (allData.length === 0) {
          throw new Error('No data loaded from response files');
        }

        setData(allData);
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
          backgroundColor: 'var(--theme-glass-bg)',
          border: '1px solid var(--theme-glass-border)',
          borderRadius: 'var(--glass-radius-lg, 16px)',
          boxShadow: 'var(--theme-shadow-md)'
        }}>
          <Typography color="error" variant="h6">
            加载失败: {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <PagePanel
      sx={{}}
      contentSx={{ minHeight: 0 }}
    >
      <MobileTableContainer
        height="100%"
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
                    borderRight: column.isLast ? 'none' : '1px solid var(--theme-glass-border-heavy)'
                  }}
                >
                  {isMobile && column.mobileLabel ? column.mobileLabel : column.label}
                </ResponsiveTableCell>
              ))}
            </ResponsiveTableRow>
          </ResponsiveTableHead>
          <ResponsiveTableBody>
            {data.map((row) => (
              <ResponsiveTableRow
                key={row.id}
                sx={tableStyles.tableRow}
              >
                <ResponsiveTableCell
                  sticky
                  hideOnSmallMobile={false}
                  hideOnMobile={false}
                  priority="high"
                  sx={{
                    ...tableStyles.bodyCell,
                    ...tableStyles.dynastyCell,
                    textAlign: 'center'
                  }}
                >
                  <Typography sx={tableStyles.dynastyName}>
                    {row.dynasty}
                  </Typography>
                </ResponsiveTableCell>

                <ResponsiveTableCell
                  hideOnSmallMobile={true}
                  hideOnMobile={false}
                  priority="medium"
                  sx={{
                    ...tableStyles.bodyCell,
                    textAlign: 'center'
                  }}
                >
                  {row.title}
                </ResponsiveTableCell>

                <ResponsiveTableCell
                  hideOnSmallMobile={false}
                  hideOnMobile={false}
                  priority="high"
                  sx={{
                    ...tableStyles.bodyCell,
                    textAlign: 'center'
                  }}
                >
                  {row.name}
                </ResponsiveTableCell>

                <ResponsiveTableCell
                  hideOnSmallMobile={true}
                  hideOnMobile={false}
                  priority="medium"
                  sx={{
                    ...tableStyles.bodyCell,
                    textAlign: 'center'
                  }}
                >
                  {row.yearName}
                </ResponsiveTableCell>

                <ResponsiveTableCell
                  hideOnSmallMobile={true}
                  hideOnMobile={true}
                  priority="low"
                  sx={{
                    ...tableStyles.bodyCell,
                    textAlign: 'center'
                  }}
                >
                  {row.duration}
                </ResponsiveTableCell>

                <ResponsiveTableCell
                  hideOnSmallMobile={true}
                  hideOnMobile={true}
                  priority="low"
                  sx={{
                    ...tableStyles.bodyCell,
                    textAlign: 'center'
                  }}
                >
                  {row.ganZhi}
                </ResponsiveTableCell>

                <ResponsiveTableCell
                  hideOnSmallMobile={true}
                  hideOnMobile={true}
                  priority="low"
                  sx={{
                    ...tableStyles.bodyCell,
                    textAlign: 'center'
                  }}
                >
                  -
                </ResponsiveTableCell>

                <ResponsiveTableCell
                  hideOnSmallMobile={false}
                  hideOnMobile={false}
                  priority="high"
                  sx={{
                    ...tableStyles.bodyCell,
                    textAlign: 'center',
                    borderRight: 'none'
                  }}
                >
                  {row.startYear}
                </ResponsiveTableCell>
              </ResponsiveTableRow>
            ))}
          </ResponsiveTableBody>
        </ResponsiveTable>
      </MobileTableContainer>
    </PagePanel>
  );
}
