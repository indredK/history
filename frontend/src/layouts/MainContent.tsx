import { Box } from '@mui/material';
import { Timeline } from '../features/timeline/Timeline';
import { MapView } from '../features/map/MapView';
import { MapErrorBoundary } from '../features/map/components/MapErrorBoundary';
import { EventList } from '../features/events/EventList';
import { PeoplePage } from '../features/people/PeoplePage';
import { CulturePage } from '../features/culture/CulturePage';
import { useDynastyStore } from '../store';
import { useDynastyImage } from '../hooks/useDynastyImage';

interface MainContentProps {
  activeTab: 'timeline' | 'map' | 'people' | 'culture';
}

export function MainContent({ activeTab }: MainContentProps) {
  const { selectedDynasty } = useDynastyStore();
  const { imageUrl: dynastyBackgroundUrl } = useDynastyImage(selectedDynasty?.id ?? null);

  // 将朝代颜色转换为rgba格式
  const getDynastyColorWithAlpha = (color: string | undefined, alpha: number) => {
    if (!color) return `rgba(139, 69, 19, ${alpha})`;
    
    // 如果是十六进制颜色，转换为rgba
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    return color;
  };

  const dynastyColor = selectedDynasty?.color;
  const gradientColor1 = getDynastyColorWithAlpha(dynastyColor, 0.15);
  const gradientColor2 = getDynastyColorWithAlpha(dynastyColor, 0.08);
  const bgColor = getDynastyColorWithAlpha(dynastyColor, 0.12);

  return (
    <Box component="main" sx={{
      flex: 1,
      overflow: 'hidden',
      padding: '16px',
      marginTop: 0,
      background: selectedDynasty && dynastyBackgroundUrl ?
        `linear-gradient(
          to bottom right,
          ${gradientColor1},
          ${gradientColor2},
          transparent 50%
        ),
        url(${dynastyBackgroundUrl}) no-repeat center center fixed,
        var(--color-bg-gradient)`
        : 'var(--color-bg-gradient)',
      backgroundSize: 'cover',
      transition: 'all 0.5s ease-in-out, background-color 0.5s ease-in-out',
      backgroundColor: selectedDynasty ? bgColor : 'transparent',
    }}>
      <div className="content" style={{ height: '100%', position: 'relative' }}>
        {activeTab === 'map' ? (
          <MapErrorBoundary>
            <MapView />
          </MapErrorBoundary>
        ) : activeTab === 'people' ? (
          <PeoplePage />
        ) : activeTab === 'culture' ? (
          <CulturePage />
        ) : (
          <>
            <Timeline />
            <EventList />
          </>
        )}
      </div>
    </Box>
  );
}
