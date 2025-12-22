/**
 * 文化页面标签切换组件
 * Culture Tabs Component
 * 
 * 在"思想流派"和"文化名人"之间切换
 * 
 * Requirements: 2.1, 2.2, 2.3
 */

import { Box, Tabs, Tab } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';

type TabValue = 'schools' | 'scholars';

interface CultureTabsProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
}

/**
 * 文化页面标签切换组件
 * 
 * Requirements 2.1: 显示"思想流派"作为第一个标签
 * Requirements 2.2: 使用适当的图标
 * Requirements 2.3: 保持"文化名人"作为第二个标签
 */
export function CultureTabs({ activeTab, onTabChange }: CultureTabsProps) {
  const handleChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    onTabChange(newValue);
  };

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'var(--color-border)',
        mb: 3,
      }}
    >
      <Tabs
        value={activeTab}
        onChange={handleChange}
        aria-label="文化页面标签"
        sx={{
          '& .MuiTabs-indicator': {
            backgroundColor: 'var(--color-primary)',
          },
          '& .MuiTab-root': {
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
            fontSize: '1rem',
            textTransform: 'none',
            minHeight: '48px',
            '&.Mui-selected': {
              color: 'var(--color-primary)',
            },
            '&:hover': {
              color: 'var(--color-primary)',
              opacity: 0.8,
            },
          },
        }}
      >
        <Tab
          value="schools"
          label="思想流派"
          icon={<MenuBookIcon sx={{ fontSize: '1.2rem' }} />}
          iconPosition="start"
          sx={{ gap: 1 }}
        />
        <Tab
          value="scholars"
          label="文化名人"
          icon={<PersonIcon sx={{ fontSize: '1.2rem' }} />}
          iconPosition="start"
          sx={{ gap: 1 }}
        />
      </Tabs>
    </Box>
  );
}

export default CultureTabs;
