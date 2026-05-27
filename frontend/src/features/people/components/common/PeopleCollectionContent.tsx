import type { ReactNode } from 'react';
import { Box, Button, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

import { PeopleFilter } from './PeopleFilter';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  name: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

interface SortOption {
  value: string;
  label: string;
}

interface PeopleCollectionContentProps {
  error: Error | null;
  onRetry: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filters: FilterConfig[];
  sortBy: string;
  sortOptions: SortOption[];
  onSortChange: (value: string) => void;
  resultCount: number;
  resultLabel: string;
  grid: ReactNode;
  modal: ReactNode;
}

export function PeopleCollectionContent({
  error,
  onRetry,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  filters,
  sortBy,
  sortOptions,
  onSortChange,
  resultCount,
  resultLabel,
  grid,
  modal,
}: PeopleCollectionContentProps) {
  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          color: 'var(--color-text-secondary)',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          加载失败
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {error.message || '请检查网络连接后重试'}
        </Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRetry}>
          重试
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flexShrink: 0 }}>
        <PeopleFilter
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          filters={filters}
          sortBy={sortBy}
          sortOptions={sortOptions}
          onSortChange={onSortChange}
          resultCount={resultCount}
          resultLabel={resultLabel}
        />
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
        {grid}
      </Box>
      {modal}
    </Box>
  );
}
