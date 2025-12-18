import { create } from 'zustand';
import type { Feature } from 'geojson';
import type { ViewportState } from '@/services/map/types';

interface MapState extends ViewportState {
  bearing: number;
  pitch: number;
  
  // Feature selection
  selectedFeature: Feature | null;
  hoveredFeature: Feature | null;
  
  // Hover effects
  hoveredFeatureId: string | null;
  hoveredLayerType: 'admin' | 'dynasty' | null;
  
  // Layer controls - 基础行政区域层
  adminBoundaryVisible: boolean;
  adminBoundaryOpacity: number;
  
  // Layer controls - 历史朝代边界层
  dynastyBoundaryVisible: boolean;
  dynastyBoundaryOpacity: number;
  
  // Event markers
  eventMarkersVisible: boolean;
  
  // Actions
  setLocation: (_lat: number, _lon: number, _zoom: number) => void;
  setViewport: (_viewport: Partial<ViewportState>) => void;
  setSelectedFeature: (_feature: Feature | null) => void;
  setHoveredFeature: (_feature: Feature | null) => void;
  setHoveredFeatureId: (_featureId: string | null, _layerType: 'admin' | 'dynasty' | null) => void;
  
  // 基础行政区域层控制
  toggleAdminBoundary: () => void;
  setAdminBoundaryOpacity: (_opacity: number) => void;
  
  // 历史朝代边界层控制
  toggleDynastyBoundary: () => void;
  setDynastyBoundaryOpacity: (_opacity: number) => void;
  
  // 事件标记控制
  toggleEventMarkers: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  // Viewport state - 调整到测试区域中心
  latitude: 35,
  longitude: 110,
  zoom: 4,
  bearing: 0,
  pitch: 0,
  
  // Feature selection
  selectedFeature: null,
  hoveredFeature: null,
  
  // Hover effects
  hoveredFeatureId: null,
  hoveredLayerType: null,
  
  // Layer controls - 基础行政区域层
  adminBoundaryVisible: true,
  adminBoundaryOpacity: 0.3,
  
  // Layer controls - 历史朝代边界层  
  dynastyBoundaryVisible: true,
  dynastyBoundaryOpacity: 0.8,
  
  // Event markers
  eventMarkersVisible: true,
  
  // Actions
  setLocation: (_lat, _lon, _zoom) => 
    set({ latitude: _lat, longitude: _lon, zoom: _zoom }),
  
  setViewport: (_viewport) => 
    set((state) => ({ ...state, ..._viewport })),
  
  setSelectedFeature: (_feature) => 
    set({ selectedFeature: _feature }),
  
  setHoveredFeature: (_feature) => 
    set({ hoveredFeature: _feature }),
  
  setHoveredFeatureId: (_featureId: string | null, _layerType: 'admin' | 'dynasty' | null) =>
    set({ hoveredFeatureId: _featureId, hoveredLayerType: _layerType }),
  
  // 基础行政区域层控制
  toggleAdminBoundary: () => 
    set((state) => ({ adminBoundaryVisible: !state.adminBoundaryVisible })),
  
  setAdminBoundaryOpacity: (_opacity) => 
    set({ adminBoundaryOpacity: Math.max(0, Math.min(1, _opacity)) }),
  
  // 历史朝代边界层控制
  toggleDynastyBoundary: () => 
    set((state) => ({ dynastyBoundaryVisible: !state.dynastyBoundaryVisible })),
  
  setDynastyBoundaryOpacity: (_opacity) => 
    set({ dynastyBoundaryOpacity: Math.max(0, Math.min(1, _opacity)) }),
  
  // 事件标记控制
  toggleEventMarkers: () => 
    set((state) => ({ eventMarkersVisible: !state.eventMarkersVisible })),
}));
