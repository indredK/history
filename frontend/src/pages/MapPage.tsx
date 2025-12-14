import { MapView } from '../features/map/MapView';
import { MapErrorBoundary } from '../features/map/components/MapErrorBoundary';

function MapPage() {
  return (
    <MapErrorBoundary>
      <MapView />
    </MapErrorBoundary>
  );
}

export default MapPage;