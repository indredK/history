import { EChartsMapView } from '../features/map/EChartsMapView';
import { MapErrorBoundary } from '../features/map/components/MapErrorBoundary';

function MapPage() {
  return (
    <MapErrorBoundary>
      <EChartsMapView />
    </MapErrorBoundary>
  );
}

export default MapPage;