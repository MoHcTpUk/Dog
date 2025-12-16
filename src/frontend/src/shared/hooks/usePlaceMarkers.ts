import { useEffect, useRef } from 'react';
import type { Place } from '@features/map';
import type { MapInstance, MapGLAPI, MapMarker } from '@features/map/types/map.types';

interface UsePlaceMarkersProps {
  mapInstance: MapInstance | null;
  mapglAPI: MapGLAPI | null;
  places: Place[];
}

export const usePlaceMarkers = ({ mapInstance, mapglAPI, places }: UsePlaceMarkersProps) => {
  const markersRef = useRef<MapMarker[]>([]);

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
};
