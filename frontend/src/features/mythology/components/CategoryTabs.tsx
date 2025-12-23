/**
 * 神话页面分类标签组件
 * Category Tabs Component
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { 
  Select, 
  MenuItem, 
  FormControl,
  useMediaQuery,
  useTheme,
  SelectChangeEvent,
} from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { CommonTabs, type CommonTabItem } from '@/components/common';

export type MythologyViewType = 'mythology' | 'religion';

interface CategoryTabsProps {
  activeTab: MythologyViewType;
  onTabChange: (tab: MythologyViewType) => void;
}

const tabs: CommonTabItem[] = [
  {
    value: 'mythology',
    label: '神话故事',
    icon: <AutoStoriesIcon />,
  },
  {
    value: 'religion',
    label: '宗教关系',
    icon: <AccountTreeIcon />,
  },
];

/**
 * 神话页面分类标签组件
 */
export function CategoryTabs({ activeTab, onTabChange }: CategoryTabsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSelectChange = (event: SelectChangeEvent<MythologyViewType>) => {
    onTabChange(event.target.value as MythologyViewType);
  };

  // 移动端使用下拉菜单
  if (isMobile) {
    return (
      <FormControl 
        fullWidth 
        size="small"
        sx={{ mb: 2 }}
      >
        <Select
          value={activeTab}
          onChange={handleSelectChange}
          sx={{
            backgroundColor: 'var(--glass-bg-white, rgba(255, 255, 255, 0.1))',
            backdropFilter: 'blur(var(--glass-blur-light, 12px))',
            borderRadius: 'var(--glass-radius-md, 12px)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--glass-border-color, rgba(255, 255, 255, 0.18))',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-primary)',
            },
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            },
          }}
        >
          {tabs.map(tab => (
            <MenuItem 
              key={tab.value} 
              value={tab.value}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {tab.icon}
              {tab.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  // 桌面端使用公共标签组件
  return (
    <CommonTabs
      tabs={tabs}
      value={activeTab}
      onChange={(value) => onTabChange(value as MythologyViewType)}
      ariaLabel="神话页面视图切换"
    />
  );
}

export default CategoryTabs;
