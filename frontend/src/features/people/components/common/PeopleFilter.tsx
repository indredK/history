import { Box, TextField, MenuItem, Typography } from '@mui/material';

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

interface PeopleFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filters: FilterConfig[];
  sortBy: string;
  sortOptions: SortOption[];
  onSortChange: (value: string) => void;
  resultCount: number;
  resultLabel: string;
}

export function PeopleFilter({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  filters,
  sortBy,
  sortOptions,
  onSortChange,
  resultCount,
  resultLabel,
}: PeopleFilterProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1 }}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ minWidth: 200, flex: 1 }}
        />
        {filters.map((filter) => (
          <TextField
            key={filter.name}
            select
            size="small"
            label={filter.label}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            {filter.options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        ))}
        <TextField
          select
          size="small"
          label="排序"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          {sortOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <Typography variant="body2" color="text.secondary">
        共 {resultCount} {resultLabel}
      </Typography>
    </Box>
  );
}
