import { Stack, Button } from '@mui/material';
import {
  History,
  MapOutlined,
  People,
  Palette
} from '@mui/icons-material';

interface NavigationItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface NavigationSectionProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems: NavigationItem[] = [
  {
    key: 'timeline',
    label: '时间轴',
    icon: <History />
  },
  {
    key: 'map',
    label: '地图',
    icon: <MapOutlined />
  },
  {
    key: 'people',
    label: '人物',
    icon: <People />
  },
  {
    key: 'culture',
    label: '文化',
    icon: <Palette />
  }
];

export function NavigationSection({ activeTab, onTabChange }: NavigationSectionProps) {
  return (
    <Stack spacing={2}>
      {navigationItems.map((item) => (
        <Button
          key={item.key}
          variant={activeTab === item.key ? 'contained' : 'outlined'}
          startIcon={item.icon}
          onClick={() => onTabChange(item.key)}
          fullWidth
          sx={{
            borderRadius: 'var(--radius-lg)',
            background: activeTab === item.key 
              ? item.key === 'timeline' ? 'var(--color-primary-gradient)' 
                : item.key === 'map' ? 'var(--color-secondary-gradient)'
                : item.key === 'people' ? 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)'
                : 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)'
              : 'transparent',
            boxShadow: activeTab === item.key ? 'var(--shadow-md), var(--shadow-glow)' : 'var(--shadow-sm)',
            '&:hover': {
              background: activeTab === item.key 
                ? undefined
                : item.key === 'timeline' ? 'rgba(255, 61, 0, 0.1)'
                  : item.key === 'map' ? 'rgba(3, 169, 244, 0.1)'
                  : item.key === 'people' ? 'rgba(76, 175, 80, 0.1)'
                  : 'rgba(156, 39, 176, 0.1)',
              boxShadow: 'var(--shadow-md), var(--shadow-glow)',
              transform: 'translateY(-2px)'
            },
            transition: 'all var(--transition-normal)'
          }}
        >
          {item.label}
        </Button>
      ))}
    </Stack>
  );
}