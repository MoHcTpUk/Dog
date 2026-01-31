import { useEffect, useRef } from 'react';
import type { Place } from '@features/map';
import type { MapInstance, MapGLAPI, MapMarker } from '@features/map/types/map.types';

interface UsePlaceMarkersProps {
  mapInstance: MapInstance | null;
  mapglAPI: MapGLAPI | null;
  places: Place[];
  isPaused?: boolean;
}

interface PlaceMarkerData {
  marker: MapMarker;
  placeId: string;
}

export const usePlaceMarkers = ({ mapInstance, mapglAPI, places, isPaused = false }: UsePlaceMarkersProps) => {
  const markersRef = useRef<PlaceMarkerData[]>([]);

  useEffect(() => {
    if (isPaused) return;

    if (!mapInstance || !mapglAPI) return;

    const newPlacesMap = new Map(places.map(place => [place.id, place]));
    const oldPlacesMap = new Map(markersRef.current.map(m => [m.placeId, m]));

    const markersToRemove = markersRef.current.filter(m => !newPlacesMap.has(m.placeId));
    const markersToKeep = markersRef.current.filter(m => newPlacesMap.has(m.placeId));

    markersToRemove.forEach(({ marker }) => marker.destroy());

    const placesToCreate = places.filter(place => !oldPlacesMap.has(place.id));

    placesToCreate.forEach((place) => {
      const marker = new mapglAPI.Marker(mapInstance, {
        coordinates: place.coordinates,
      });
      markersToKeep.push({ marker, placeId: place.id });
    });

    markersRef.current = markersToKeep;

    return () => {
      markersRef.current.forEach(({ marker }) => marker.destroy());
      markersRef.current = [];
    };
  }, [isPaused, places, mapglAPI, mapInstance]);
};
