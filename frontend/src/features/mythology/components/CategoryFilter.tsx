/**
 * 分类筛选器组件
 * Category Filter Component
 * 
 * Requirements: 4.1, 4.2, 4.4
 */

import { Box, Chip } from '@mui/material';
import type { MythologyCategory } from '@/services/mythology';
import { VALID_CATEGORIES } from '@/services/mythology';

interface CategoryFilterProps {
  activeCategory: MythologyCategory | null;
  onCategoryChange: (category: MythologyCategory | null) => void;
}

/**
 * 分类筛选器组件
 * 显示"全部"和各分类按钮，支持点击切换筛选
 */
export function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        mb: 3,
      }}
      role="group"
      aria-label="神话分类筛选"
    >
      {/* 全部选项 */}
      <Chip
        label="全部"
        onClick={() => onCategoryChange(null)}
        variant={activeCategory === null ? 'filled' : 'outlined'}
        color={activeCategory === null ? 'primary' : 'default'}
        sx={{
          fontWeight: activeCategory === null ? 600 : 400,
          transition: 'all 0.2s ease-in-out',
          color: activeCategory === null ? undefined : 'var(--color-text-primary)',
          borderColor: activeCategory === null ? undefined : 'var(--color-border)',
          '&:hover': {
            transform: 'scale(1.05)',
            borderColor: 'var(--color-primary)',
          },
        }}
        aria-pressed={activeCategory === null}
      />

      {/* 各分类选项 */}
      {VALID_CATEGORIES.map((category) => (
        <Chip
          key={category}
          label={category}
          onClick={() => onCategoryChange(category)}
          variant={activeCategory === category ? 'filled' : 'outlined'}
          color={activeCategory === category ? 'primary' : 'default'}
          sx={{
            fontWeight: activeCategory === category ? 600 : 400,
            transition: 'all 0.2s ease-in-out',
            color: activeCategory === category ? undefined : 'var(--color-text-primary)',
            borderColor: activeCategory === category ? undefined : 'var(--color-border)',
            '&:hover': {
              transform: 'scale(1.05)',
              borderColor: 'var(--color-primary)',
            },
          }}
          aria-pressed={activeCategory === category}
        />
      ))}
    </Box>
  );
}

export default CategoryFilter;
