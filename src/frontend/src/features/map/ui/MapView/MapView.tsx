import React, { useEffect, useRef } from "react";
import { useMapLoader } from "../../hooks/useMapLoader";

export interface Place {
  id: string;
  name: string;
  coordinates: [number, number];
  dogFriendly: boolean;
}

interface MapViewProps {
  onMapReady?: (map: any, mapglAPI: any) => void;
  places?: Place[];
  center?: [number, number];
  zoom?: number;
}

export const MapView: React.FC<MapViewProps> = ({
  onMapReady,
  places = [],
  center = [37.573856, 55.751574],
  zoom = 13,
}) => {
  const { mapglAPI, mapInstance, isLoading } = useMapLoader({
    center,
    zoom,
    onMapReady,
  });
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapInstance || !mapglAPI) return;

    markersRef.current.forEach((marker) => marker.destroy());
    markersRef.current = [];

    places.forEach((place) => {
      const marker = new mapglAPI.Marker(mapInstance, {
        coordinates: place.coordinates,
      });
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.destroy());
      markersRef.current = [];
    };
  }, [places, mapglAPI, mapInstance]);

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
