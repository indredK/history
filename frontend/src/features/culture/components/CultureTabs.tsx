/**
 * 文化页面标签切换组件
 * Culture Tabs Component
 * 
 * 在"朝代"和"文化名人"之间切换
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

import { Box, Tabs, Tab } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';

type TabValue = 'dynasties' | 'scholars';

interface CultureTabsProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
}

/**
 * 文化页面标签切换组件
 * 
 * Requirements 6.1: 显示"朝代"和"文化名人"标签
 * Requirements 6.2: 切换标签时显示对应内容
 * Requirements 6.3: 保持标签状态
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
          value="dynasties"
          label="朝代"
          icon={<HistoryIcon sx={{ fontSize: '1.2rem' }} />}
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
