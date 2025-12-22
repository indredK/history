/**
 * 分类标签页组件
 * Category Tabs Component
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { 
  Box, 
  Tabs, 
  Tab, 
  Select, 
  MenuItem, 
  FormControl,
  useMediaQuery,
  useTheme,
  SelectChangeEvent,
} from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

export type MythologyViewType = 'mythology' | 'religion';

interface CategoryTabsProps {
  activeTab: MythologyViewType;
  onTabChange: (tab: MythologyViewType) => void;
}

interface TabConfig {
  id: MythologyViewType;
  label: string;
  icon: React.ReactElement;
}

const tabs: TabConfig[] = [
  {
    id: 'mythology',
    label: '神话故事',
    icon: <AutoStoriesIcon />,
  },
  {
    id: 'religion',
    label: '宗教关系',
    icon: <AccountTreeIcon />,
  },
];

/**
 * 分类标签页组件
 * 支持"神话故事"和"宗教关系"两个视图切换
 */
export function CategoryTabs({ activeTab, onTabChange }: CategoryTabsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const tab = tabs[newValue];
    if (tab) {
      onTabChange(tab.id);
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<MythologyViewType>) => {
    onTabChange(event.target.value as MythologyViewType);
  };

  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);

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
              key={tab.id} 
              value={tab.id}
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

  // 桌面端使用标签页
  return (
    <Box 
      sx={{ 
        mb: 1,
        borderBottom: 1,
        borderColor: 'var(--glass-border-color, rgba(255, 255, 255, 0.18))',
      }}
    >
      <Tabs
        value={currentTabIndex}
        onChange={handleTabChange}
        aria-label="神话页面视图切换"
        sx={{
          minHeight: 36,
          '& .MuiTabs-indicator': {
            backgroundColor: 'var(--color-primary)',
            height: 2,
            borderRadius: '2px 2px 0 0',
          },
          '& .MuiTab-root': {
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
            fontSize: '0.85rem',
            textTransform: 'none',
            minHeight: 36,
            padding: '6px 12px',
            transition: 'all 0.3s ease',
            '&:hover': {
              color: 'var(--color-text-primary)',
              backgroundColor: 'rgba(var(--color-primary-rgb, 100, 150, 255), 0.08)',
            },
            '&.Mui-selected': {
              color: 'var(--color-primary)',
              fontWeight: 600,
            },
            '& .MuiSvgIcon-root': {
              fontSize: '1rem',
            },
          },
        }}
      >
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            icon={tab.icon}
            iconPosition="start"
            label={tab.label}
            id={`mythology-tab-${tab.id}`}
            aria-controls={`mythology-tabpanel-${tab.id}`}
          />
        ))}
      </Tabs>
    </Box>
  );
}

export default CategoryTabs;
