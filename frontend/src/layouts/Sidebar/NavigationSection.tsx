import { Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { navigationItems, getNavigationItemTheme, navigationStyles } from '@/config';

interface NavigationSectionProps {
  activeTab: string;
}

export function NavigationSection({ activeTab }: NavigationSectionProps) {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Stack spacing={2}>
      {navigationItems.map((item) => {
        const theme = getNavigationItemTheme(item.key);
        const isActive = activeTab === item.key;
        
        return (
          <Button
            key={item.key}
            variant={isActive ? 'contained' : 'outlined'}
            startIcon={item.icon}
            onClick={() => handleNavigation(item.path)}
            fullWidth
            sx={{
              ...navigationStyles.button,
              background: isActive ? theme?.gradient : navigationStyles.inactiveButton.background,
              boxShadow: isActive ? navigationStyles.activeButton.boxShadow : navigationStyles.inactiveButton.boxShadow,
              color: isActive ? navigationStyles.activeButton.color : undefined,
              '&:hover': {
                background: isActive ? undefined : theme?.hoverBackground,
                ...navigationStyles.hoverEffect
              }
            }}
          >
            {item.label}
          </Button>
        );
      })}
    </Stack>
  );
}