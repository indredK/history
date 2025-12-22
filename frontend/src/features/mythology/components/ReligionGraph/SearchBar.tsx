/**
 * 搜索栏组件
 * Search Bar Component
 * 
 * Requirements: 6.3, 6.4
 */

import { useState, useCallback } from 'react';
import { 
  Box, 
  TextField, 
  InputAdornment,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useDebounceFn } from 'ahooks';
import { useReligionStore } from '@/store/religionStore';

/**
 * 搜索栏组件
 * 实现神仙名称搜索，搜索结果高亮
 */
export function SearchBar() {
  const [inputValue, setInputValue] = useState('');
  const { setSearchQuery } = useReligionStore();

  // 防抖搜索
  const { run: debouncedSearch } = useDebounceFn(
    (query: string) => {
      setSearchQuery(query);
    },
    { wait: 300 }
  );

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleClear = useCallback(() => {
    setInputValue('');
    setSearchQuery('');
  }, [setSearchQuery]);

  return (
    <Box sx={{ minWidth: 150, maxWidth: 200 }}>
      <TextField
        size="small"
        placeholder="搜索神仙..."
        value={inputValue}
        onChange={handleInputChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'var(--color-text-secondary)', fontSize: 16 }} />
            </InputAdornment>
          ),
          endAdornment: inputValue && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClear}
                sx={{ 
                  padding: 0.25,
                  '&:hover': {
                    color: 'var(--color-primary)',
                  },
                }}
              >
                <ClearIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          width: '100%',
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(var(--glass-blur-light, 12px))',
            borderRadius: 'var(--glass-radius-sm, 8px)',
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: 'var(--glass-border-color, rgba(255, 255, 255, 0.18))',
            },
            '&:hover fieldset': {
              borderColor: 'var(--color-primary)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'var(--color-primary)',
              borderWidth: 1,
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          },
          '& .MuiInputBase-input': {
            color: 'var(--color-text-primary)',
            fontSize: '0.75rem',
            padding: '6px 8px',
            '&::placeholder': {
              color: 'var(--color-text-secondary)',
              opacity: 0.7,
            },
          },
        }}
      />
    </Box>
  );
}

export default SearchBar;
