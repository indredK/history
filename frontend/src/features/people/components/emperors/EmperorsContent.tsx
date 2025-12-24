/**
 * 帝王内容容器组件
 */

import { useEffect, useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useRequest } from 'ahooks';

import { useEmperorStore } from '@/store';
import { getEmperors } from '@/services/person/emperors';
import type { Emperor } from '@/services/person/emperors/types';
import type { EmperorSortBy } from '@/services/person/emperors';

import { PeopleFilter } from '../common/PeopleFilter';
import { EmperorGrid } from './EmperorGrid';
import { EmperorDetailModal } from './EmperorDetailModal';

export function EmperorsContent() {
  const {
    emperors, selectedEmperor, loading, error, filters,
    setEmperors, setSelectedEmperor, setLoading, setError,
    setDynastyFilter, setSearchQuery, setSortBy,
    getFilteredEmperors, getDynastyOptions,
  } = useEmperorStore();

  const { run: loadEmperors, loading: requestLoading } = useRequest(
    async () => {
      const result = await getEmperors();
      return result.data;
    },
    {
      manual: true,
      cacheKey: 'emperors',
      onBefore: () => setLoading(true),
      onSuccess: (data) => { setEmperors(data); setError(null); },
      onError: (err) => { console.error('获取帝王数据失败:', err); setError(err as Error); },
      onFinally: () => setLoading(false),
    }
  );

  useEffect(() => {
    if (emperors.length === 0 && !loading) loadEmperors();
  }, [emperors.length, loading, loadEmperors]);

  const filteredEmperors = useMemo(() => getFilteredEmperors(), [getFilteredEmperors, emperors, filters]);
  const dynastyOptions = useMemo(() => getDynastyOptions(), [getDynastyOptions, emperors]);

  const handleEmperorClick = (emperor: Emperor) => setSelectedEmperor(emperor);
  const handleCloseModal = () => setSelectedEmperor(null);

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', color: 'var(--color-text-secondary)' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>加载失败</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>{error.message || '请检查网络连接后重试'}</Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => loadEmperors()}>重试</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flexShrink: 0 }}>
        <PeopleFilter
          searchQuery={filters.searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="搜索帝王姓名、年号..."
          filters={[{ name: 'dynasty', label: '朝代', value: filters.dynasty, options: dynastyOptions.map(d => ({ value: d, label: d })), onChange: setDynastyFilter }]}
          sortBy={filters.sortBy}
          sortOptions={[{ value: 'dynasty', label: '按朝代' }, { value: 'reignStart', label: '按在位时间' }]}
          onSortChange={(value) => setSortBy(value as EmperorSortBy)}
          resultCount={filteredEmperors.length}
          resultLabel="位帝王"
        />
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
        <EmperorGrid emperors={filteredEmperors} onEmperorClick={handleEmperorClick} loading={loading || requestLoading} />
      </Box>
      <EmperorDetailModal emperor={selectedEmperor} open={selectedEmperor !== null} onClose={handleCloseModal} />
    </Box>
  );
}

export default EmperorsContent;
