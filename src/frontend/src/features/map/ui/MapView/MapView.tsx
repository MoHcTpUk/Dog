import React from "react";
import { useMapLoader } from "../../hooks/useMapLoader";
import type { Walk } from "@shared/types/walk";
import { useMapZoom, usePlaceMarkers, useWalkMarkers } from "@shared/hooks";
import type { MapInstance, MapGLAPI } from "../../types/map.types";

export interface Place {
  id: string;
  name: string;
  coordinates: [number, number];
  dogFriendly: boolean;
}

interface MapViewProps {
  onMapReady?: (map: MapInstance, mapglAPI: MapGLAPI) => void;
  places?: Place[];
  walks?: Walk[];
  center?: [number, number];
  zoom?: number;
}

export const MapView: React.FC<MapViewProps> = ({
  onMapReady,
  places = [],
  walks = [],
  center = [37.573856, 55.751574],
  zoom = 13,
}) => {
  const { mapglAPI, mapInstance, isLoading } = useMapLoader({
    center,
    zoom,
    onMapReady,
  });

  const { clusterZoomLevel, handleClusterClick, hasClusteringChanged } = useMapZoom({
    mapInstance,
    initialZoom: zoom,
  });

  usePlaceMarkers({ mapInstance, mapglAPI, places });

  useWalkMarkers({
    mapInstance,
    mapglAPI,
    walks,
    clusterZoomLevel,
    hasClusteringChanged,
    onClusterClick: handleClusterClick,
  });

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
