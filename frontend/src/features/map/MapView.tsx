import { useEffect } from 'react';
import { useMapStore } from '../../store';
import '../../components/MapView.css';

export function MapView() {
  const { latitude, longitude, zoom, setLocation } = useMapStore();

  useEffect(() => {
    // Map placeholder
  }, []);

  return (
    <div  >
      <div className="map-header">
        <h2>历史地图 (Historical Map)</h2>
      </div>
      <div className="map-view" id="map">
        <div className="map-placeholder">
          <p>纬度: {latitude.toFixed(2)}</p>
          <p>经度: {longitude.toFixed(2)}</p>
          <p>缩放: {zoom}</p>
          <button onClick={() => setLocation(34.34, 108.95, 4)}>
            定位到长安 (Chang'an)
          </button>
        </div>
      </div>
    </div>
  );
}

