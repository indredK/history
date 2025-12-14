import { Box } from '@mui/material';
import { Timeline } from '../features/timeline/Timeline';
import { MapView } from '../features/map/MapView';
import { EventList } from '../features/events/EventList';
import { useDynastyStore } from '../store';
import { useDynastyImage } from '../hooks/useDynastyImage';

interface MainContentProps {
  activeTab: 'timeline' | 'map';
}

export function MainContent({ activeTab }: MainContentProps) {
  const { selectedDynasty } = useDynastyStore();
  const { imageUrl: dynastyBackgroundUrl } = useDynastyImage(selectedDynasty?.id ?? null);

  return (
    <Box component="main" sx={{
      flex: 1,
      overflow: 'hidden',
      padding: '16px',
      marginTop: 0,
      background: selectedDynasty && dynastyBackgroundUrl ?
        `linear-gradient(
          to bottom right,
          rgba(139, 69, 19, 0.1),
          rgba(139, 69, 19, 0.05),
          transparent 50%
        ),
        url(${dynastyBackgroundUrl}) no-repeat center center fixed,
        var(--color-bg-gradient)`
        : 'var(--color-bg-gradient)',
      backgroundSize: 'cover',
      transition: 'all 0.5s ease-in-out, background-color 0.5s ease-in-out',
      backgroundColor: selectedDynasty ? 'rgba(139, 69, 19, 0.1)' : 'transparent',
    }}>
      <div className="content" style={{ height: '100%', position: 'relative' }}>
        {activeTab === 'map' ? (
          <MapView />
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
