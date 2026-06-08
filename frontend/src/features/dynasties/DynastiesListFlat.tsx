import { useState, useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { loadJsonData } from '@/utils/services/dataLoaders';
import { DynastiesVirtualTable } from './DynastiesVirtualTable';
import { ApiResponse, TableRowData } from './types';

const RESPONSE_FILE_COUNT = 9;

/** 加载单个 response 文件并转换为表格行；单文件失败只 warn 并返回空数组，不阻塞其余文件。 */
async function loadResponseFile(index: number): Promise<TableRowData[]> {
  try {
    const response = await loadJsonData<ApiResponse>(
      `/data/json/response${index}.json`,
    );
    if (!response?.yearRows) return [];
    return response.yearRows.map((row) => ({
      id: row.id,
      dynasty: row.polity,
      title: row.rulerAlias,
      name: row.ruler,
      yearName: row.eraFullName,
      duration: row.eraYearNo,
      ganZhi: row.sexagenary,
      startYear: row.year.toString(),
    }));
  } catch (err) {
    console.warn(`Error loading response${index}.json:`, err);
    return [];
  }
}

export function DynastiesListFlat() {
  const [data, setData] = useState<TableRowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        // 并行加载 response1-9.json（原为串行 await，首屏明显变慢）
        const chunks = await Promise.all(
          Array.from({ length: RESPONSE_FILE_COUNT }, (_, k) =>
            loadResponseFile(k + 1),
          ),
        );
        if (cancelled) return;

        const allData = chunks.flat(); // 顺序 = response1..9，保持原合并顺序
        if (allData.length === 0) {
          setError('未从年表响应文件中加载到数据');
        } else {
          setData(allData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '未知错误');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <LoadingSkeleton />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            backdropFilter: 'blur(var(--glass-blur-medium, 20px))',
            WebkitBackdropFilter: 'blur(var(--glass-blur-medium, 20px))',
            backgroundColor: 'var(--theme-glass-bg)',
            border: '1px solid var(--theme-glass-border)',
            borderRadius: 'var(--glass-radius-lg, 16px)',
            boxShadow: 'var(--theme-shadow-md)',
          }}
        >
          <Typography color="error" variant="h6">
            加载失败: {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <DynastiesVirtualTable data={data} />
    </Box>
  );
}
