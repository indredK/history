/**
 * 筛选控制组件
 * Filter Controls Component
 * 
 * Requirements: 6.1, 6.2, 6.5
 */

import { 
  Box, 
  Chip, 
  Typography,
  Button,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useReligionStore } from '@/store/religionStore';
import { VALID_SECTS, SECT_COLORS, type SectType } from '@/services/religion/types';

/**
 * 筛选控制组件
 * 支持按门派筛选，多选组合
 */
export function FilterControls() {
  const { selectedSects, setSelectedSects, resetFilters } = useReligionStore();

  const handleSectToggle = (sect: SectType) => {
    if (selectedSects.includes(sect)) {
      setSelectedSects(selectedSects.filter(s => s !== sect));
    } else {
      setSelectedSects([...selectedSects, sect]);
    }
  };

  const handleClearFilters = () => {
    resetFilters();
  };

  const hasFilters = selectedSects.length > 0;

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 0.5,
        flexWrap: 'wrap',
        flex: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 0.5 }}>
        <FilterListIcon sx={{ fontSize: 14, color: 'var(--color-text-secondary)' }} />
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'var(--color-text-secondary)',
            whiteSpace: 'nowrap',
            fontSize: '0.75rem',
          }}
        >
          门派:
        </Typography>
      </Box>

      {VALID_SECTS.map(sect => (
        <Chip
          key={sect}
          label={sect}
          size="small"
          onClick={() => handleSectToggle(sect)}
          sx={{
            height: 22,
            fontSize: '0.7rem',
            backgroundColor: selectedSects.includes(sect) 
              ? SECT_COLORS[sect] 
              : 'rgba(255, 255, 255, 0.1)',
            color: selectedSects.includes(sect) 
              ? '#fff' 
              : 'var(--color-text-secondary)',
            borderColor: SECT_COLORS[sect],
            border: `1px solid ${selectedSects.includes(sect) ? 'transparent' : SECT_COLORS[sect]}`,
            transition: 'all 0.2s ease',
            '& .MuiChip-label': {
              padding: '0 6px',
            },
            '&:hover': {
              backgroundColor: selectedSects.includes(sect) 
                ? SECT_COLORS[sect] 
                : `${SECT_COLORS[sect]}33`,
            },
          }}
        />
      ))}

      {hasFilters && (
        <Button
          size="small"
          startIcon={<ClearIcon sx={{ fontSize: 12 }} />}
          onClick={handleClearFilters}
          sx={{
            ml: 0.5,
            minWidth: 'auto',
            padding: '2px 6px',
            color: 'var(--color-text-secondary)',
            fontSize: '0.7rem',
            '&:hover': {
              color: 'var(--color-primary)',
            },
          }}
        >
          清除
        </Button>
      )}
    </Box>
  );
}

export default FilterControls;
