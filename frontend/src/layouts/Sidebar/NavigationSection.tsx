import { Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  History,
  MapOutlined,
  People,
  Palette,
  AutoAwesome,
  Event
} from '@mui/icons-material';

interface NavigationItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface NavigationSectionProps {
  activeTab: string;
}

const navigationItems: NavigationItem[] = [
  {
    key: 'timeline',
    label: '时间轴',
    icon: <History />,
    path: '/timeline'
  },
  {
    key: 'map',
    label: '地图',
    icon: <MapOutlined />,
    path: '/map'
  },
  {
    key: 'people',
    label: '人物',
    icon: <People />,
    path: '/people'
  },
  {
    key: 'culture',
    label: '文化',
    icon: <Palette />,
    path: '/culture'
  },
  {
    key: 'mythology',
    label: '神话',
    icon: <AutoAwesome />,
    path: '/mythology'
  },
  {
    key: 'events',
    label: '重大事件',
    icon: <Event />,
    path: '/events'
  }
];

export function NavigationSection({ activeTab }: NavigationSectionProps) {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Stack spacing={2}>
      {navigationItems.map((item) => (
        <Button
          key={item.key}
          variant={activeTab === item.key ? 'contained' : 'outlined'}
          startIcon={item.icon}
          onClick={() => handleNavigation(item.path)}
          fullWidth
          sx={{
            borderRadius: 'var(--radius-lg)',
            background: activeTab === item.key 
              ? item.key === 'timeline' ? 'var(--color-primary-gradient)' 
                : item.key === 'map' ? 'var(--color-secondary-gradient)'
                : item.key === 'people' ? 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)'
                : item.key === 'culture' ? 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)'
                : item.key === 'mythology' ? 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)'
                : 'linear-gradient(135deg, #607D8B 0%, #90A4AE 100%)'
              : 'transparent',
            boxShadow: activeTab === item.key ? 'var(--shadow-md), var(--shadow-glow)' : 'var(--shadow-sm)',
            '&:hover': {
              background: activeTab === item.key 
                ? undefined
                : item.key === 'timeline' ? 'rgba(255, 61, 0, 0.1)'
                  : item.key === 'map' ? 'rgba(3, 169, 244, 0.1)'
                  : item.key === 'people' ? 'rgba(76, 175, 80, 0.1)'
                  : item.key === 'culture' ? 'rgba(156, 39, 176, 0.1)'
                  : item.key === 'mythology' ? 'rgba(255, 152, 0, 0.1)'
                  : 'rgba(96, 125, 139, 0.1)',
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