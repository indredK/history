import type { ReactNode } from 'react';
import { Box } from '@mui/material';

import { PeopleFilter } from './PeopleFilter';
import { StateView } from '@/components/ui';

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
      <StateView
        mode="error"
        title="加载失败"
        description={error.message || '请检查网络连接后重试'}
        actionLabel="重试"
        onAction={onRetry}
      />
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
