/**
 * 学者筛选器组件
 * Scholar Filter Component
 * 
 * 提供按朝代和学派筛选学者的功能
 * 显示匹配数量
 * 
 * Requirements: 5.1, 5.2, 5.5
 */

import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

interface ScholarFilterProps {
  selectedDynasty: string;
  selectedSchool: string;
  onDynastyChange: (dynasty: string) => void;
  onSchoolChange: (school: string) => void;
  dynastyOptions: string[];
  schoolOptions: string[];
  resultCount: number;
}

/**
 * 学者筛选器组件
 * 
 * Requirements 5.1: 朝代筛选（全部、唐代、宋代）
 * Requirements 5.2: 学派筛选（全部、儒家等）
 * Requirements 5.5: 显示匹配数量
 */
export function ScholarFilter({
  selectedDynasty,
  selectedSchool,
  onDynastyChange,
  onSchoolChange,
  dynastyOptions,
  schoolOptions,
  resultCount,
}: ScholarFilterProps) {
  const handleDynastyChange = (event: SelectChangeEvent<string>) => {
    onDynastyChange(event.target.value);
  };

  const handleSchoolChange = (event: SelectChangeEvent<string>) => {
    onSchoolChange(event.target.value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        p: 2,
        mb: 2,
        backgroundColor: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* 筛选图标和标题 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 'fit-content' }}>
        <FilterListIcon sx={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem' }} />
        <Typography
          variant="subtitle2"
          sx={{
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
          }}
        >
          筛选
        </Typography>
      </Box>

      {/* 朝代筛选 - Requirements 5.1 */}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="dynasty-filter-label">朝代</InputLabel>
        <Select
          labelId="dynasty-filter-label"
          id="dynasty-filter"
          value={selectedDynasty}
          label="朝代"
          onChange={handleDynastyChange}
          sx={{
            backgroundColor: 'var(--color-bg-card)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-border)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-primary)',
            },
          }}
        >
          {dynastyOptions.map((dynasty) => (
            <MenuItem key={dynasty} value={dynasty}>
              {dynasty}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* 学派筛选 - Requirements 5.2 */}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="school-filter-label">学派</InputLabel>
        <Select
          labelId="school-filter-label"
          id="school-filter"
          value={selectedSchool}
          label="学派"
          onChange={handleSchoolChange}
          sx={{
            backgroundColor: 'var(--color-bg-card)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-border)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-primary)',
            },
          }}
        >
          {schoolOptions.map((school) => (
            <MenuItem key={school} value={school}>
              {school}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* 结果数量显示 - Requirements 5.5 */}
      <Box sx={{ flex: 1, display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
        <Chip
          label={`共 ${resultCount} 位学者`}
          size="small"
          sx={{
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            color: '#4caf50',
            fontWeight: 500,
          }}
        />
      </Box>
    </Box>
  );
}

export default ScholarFilter;
