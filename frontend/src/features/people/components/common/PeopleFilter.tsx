/**
 * 人物筛选搜索组件
 */

import { Box, FormControl, InputLabel, Select, MenuItem, TextField, InputAdornment, Chip } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';

interface FilterOption { value: string; label: string; }
interface SortOption { value: string; label: string; }

interface PeopleFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filters?: { name: string; label: string; value: string; options: FilterOption[]; onChange: (value: string) => void; }[];
  sortBy?: string;
  sortOptions?: SortOption[];
  onSortChange?: (value: string) => void;
  resultCount: number;
  resultLabel?: string;
}

export function PeopleFilter({ searchQuery, onSearchChange, searchPlaceholder = '搜索...', filters = [], sortBy, sortOptions = [], onSortChange, resultCount, resultLabel = '位人物' }: PeopleFilterProps) {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value);
  const handleSortChange = (event: SelectChangeEvent<string>) => onSortChange?.(event.target.value);

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' }, gap: 2, p: 2, mb: 2, backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
      <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, minWidth: 'fit-content' }}>
        <FilterListIcon sx={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem' }} />
      </Box>

      <TextField size="small" placeholder={searchPlaceholder} value={searchQuery} onChange={handleSearchChange}
        sx={{ minWidth: { xs: '100%', sm: 200 }, '& .MuiOutlinedInput-root': { backgroundColor: 'var(--color-bg-card)', '& fieldset': { borderColor: 'var(--color-border)' }, '&:hover fieldset': { borderColor: 'var(--color-primary)' } } }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem' }} /></InputAdornment> }}
      />

      {filters.map((filter) => (
        <FormControl key={filter.name} size="small" sx={{ minWidth: 120 }}>
          <InputLabel id={`${filter.name}-filter-label`}>{filter.label}</InputLabel>
          <Select labelId={`${filter.name}-filter-label`} id={`${filter.name}-filter`} value={filter.value} label={filter.label} onChange={(e) => filter.onChange(e.target.value)}
            sx={{ backgroundColor: 'var(--color-bg-card)', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-primary)' } }}>
            {filter.options.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
          </Select>
        </FormControl>
      ))}

      {sortOptions.length > 0 && onSortChange && (
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="sort-filter-label"><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><SortIcon sx={{ fontSize: '1rem' }} />排序</Box></InputLabel>
          <Select labelId="sort-filter-label" id="sort-filter" value={sortBy || ''} label="排序" onChange={handleSortChange}
            sx={{ backgroundColor: 'var(--color-bg-card)', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-primary)' } }}>
            {sortOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
          </Select>
        </FormControl>
      )}

      <Box sx={{ flex: 1, display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mt: { xs: 1, md: 0 } }}>
        <Chip label={`共 ${resultCount} ${resultLabel}`} size="small" sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', fontWeight: 500 }} />
      </Box>
    </Box>
  );
}

export default PeopleFilter;
