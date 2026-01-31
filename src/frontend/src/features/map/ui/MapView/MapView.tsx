import React, { memo } from "react";
import { useMapLoader } from "../../hooks/useMapLoader";
import { useMapGL } from "../../context";
import { useMapZoom, usePlaceMarkers, useWalkMarkers } from "@shared/hooks";

export interface Place {
  id: string;
  name: string;
  coordinates: [number, number];
  dogFriendly: boolean;
}

interface MapViewProps {
  isPaused?: boolean;
  center?: [number, number];
  zoom?: number;
}

const MapViewComponent: React.FC<MapViewProps> = ({
  isPaused = false,
  center = [37.573856, 55.751574],
  zoom = 13,
}) => {
  const { displayedWalks, displayedPlaces, onWalkClick } = useMapGL();

  const { mapglAPI, mapInstance, isLoading } = useMapLoader({
    center,
    zoom,
  });

  console.log('[MapView] Rendering, isPaused:', isPaused, 'isLoading:', isLoading, 'mapInstance:', !!mapInstance);

  const { clusterZoomLevel, handleClusterClick, hasClusteringChanged } = useMapZoom({
    mapInstance,
    initialZoom: zoom,
  });

  usePlaceMarkers({
    mapInstance,
    mapglAPI,
    places: displayedPlaces,
    isPaused,
  });

  useWalkMarkers({
    mapInstance,
    mapglAPI,
    walks: displayedWalks,
    clusterZoomLevel,
    hasClusteringChanged,
    onClusterClick: handleClusterClick,
    onWalkClick: onWalkClick || undefined,
    isPaused,
  });

  // Пересчитываем размер карты когда она становится видимой
  React.useEffect(() => {
    if (!isPaused && mapInstance) {
      console.log('[MapView] Map became visible, calling invalidateSize');
      setTimeout(() => {
        mapInstance.invalidateSize?.();
      }, 100);
    }
  }, [isPaused, mapInstance]);

  return (
    <div className="relative w-full h-full">
      <div
        id="map-container"
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-gray-600">Загрузка карты...</div>
        </div>
      )}
    </div>
  );
};

export const MapView = memo(MapViewComponent);
