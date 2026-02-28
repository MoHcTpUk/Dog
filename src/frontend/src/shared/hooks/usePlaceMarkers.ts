import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import type { Place } from '@features/map/context';
import type { MapInstance, MapGLAPI, MapMarker } from '@features/map/types/map.types';
import { clusterPlaces, isPlaceCluster } from '@shared/utils/clustering.utils';
import { PlacePin, PlacePinCluster } from '@entities/place';

interface UsePlaceMarkersProps {
  mapInstance: MapInstance | null;
  mapglAPI: MapGLAPI | null;
  places: Place[];
  clusterZoomLevel: number;
  onClusterClick: (center: [number, number]) => void;
  onPlaceClick?: (placeId: string) => void;
  isPaused?: boolean;
}

interface PlaceMarkerData {
  marker: MapMarker;
  root: Root;
  id: string;
}

const getMarkerElement = (marker: MapMarker): HTMLElement | null =>
  marker.getContent?.() || marker._el || null;

export const usePlaceMarkers = ({
  mapInstance,
  mapglAPI,
  places,
  clusterZoomLevel,
  onClusterClick,
  onPlaceClick,
  isPaused = false,
}: UsePlaceMarkersProps) => {
  const markersRef = useRef<PlaceMarkerData[]>([]);
  const onClusterClickRef = useRef(onClusterClick);
  const onPlaceClickRef = useRef(onPlaceClick);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const createTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const prevClusterZoomLevelRef = useRef(clusterZoomLevel);
  const prevPlaceIdsRef = useRef<string>('');

  onClusterClickRef.current = onClusterClick;
  onPlaceClickRef.current = onPlaceClick;

  useEffect(() => {
    if (isPaused) return;
    if (!mapInstance || !mapglAPI) return;

    const hasClusteringChanged = prevClusterZoomLevelRef.current !== clusterZoomLevel;
    prevClusterZoomLevelRef.current = clusterZoomLevel;

    const currentPlaceIds = places.map((p) => p.id).join(',');
    const hasPlacesChanged = currentPlaceIds !== prevPlaceIdsRef.current;
    prevPlaceIdsRef.current = currentPlaceIds;

    if (!hasClusteringChanged && !hasPlacesChanged && markersRef.current.length > 0) return;

    if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current);
    if (createTimeoutRef.current) clearTimeout(createTimeoutRef.current);

    const clusteredItems = clusterPlaces(places, clusterZoomLevel);

    const newItemsMap = new Map(clusteredItems.map((item) => [item.id, item]));
    const oldItemsMap = new Map(markersRef.current.map((m) => [m.id, m]));

    const markersToRemove: PlaceMarkerData[] = [];
    const markersToKeep: PlaceMarkerData[] = [];

    markersRef.current.forEach((markerData) => {
      if (newItemsMap.has(markerData.id)) {
        markersToKeep.push(markerData);
      } else {
        markersToRemove.push(markerData);
      }
    });

    // Animate out removed markers
    markersToRemove.forEach(({ marker }) => {
      const element = getMarkerElement(marker);
      if (element) {
        const container = element.querySelector('.place-pin-container');
        if (container) {
          container.classList.remove('place-pin-enter');
          container.classList.add('place-pin-exit');
        }
      }
    });

    cleanupTimeoutRef.current = setTimeout(() => {
      markersToRemove.forEach(({ marker, root }) => {
        root.unmount();
        marker.destroy();
      });
    }, 350);

    markersRef.current = markersToKeep;

    const itemsToCreate = clusteredItems.filter((item) => !oldItemsMap.has(item.id));

    if (itemsToCreate.length > 0) {
      createTimeoutRef.current = setTimeout(() => {
        itemsToCreate.forEach((item) => {
          const markerElement = document.createElement('div');
          const root = createRoot(markerElement);

          if (isPlaceCluster(item)) {
            root.render(
              React.createElement(PlacePinCluster, {
                placeCount: item.placeCount,
                onClick: () => onClusterClickRef.current(item.center),
                isAnimating: true,
              })
            );

            const marker = new mapglAPI.HtmlMarker(mapInstance, {
              coordinates: item.center,
              html: markerElement,
              // anchor [0,0] + CSS translate(-50%,-50%) = центр на точке
              anchor: [0, 0],
            });

            markersRef.current.push({ marker, root, id: item.id });
          } else {
            root.render(
              React.createElement(PlacePin, {
                category: item.category,
                onClick: onPlaceClickRef.current
                  ? () => onPlaceClickRef.current!(item.id)
                  : undefined,
                isAnimating: true,
              })
            );

            const marker = new mapglAPI.HtmlMarker(mapInstance, {
              coordinates: item.coordinates,
              html: markerElement,
              // anchor [0,0] + CSS translate(-50%,-50%) = центр на точке
              anchor: [0, 0],
            });

            markersRef.current.push({ marker, root, id: item.id });
          }
        });
      }, 180);
    }

    return () => {
      if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current);
      if (createTimeoutRef.current) clearTimeout(createTimeoutRef.current);
    };
  }, [isPaused, places, mapglAPI, mapInstance, clusterZoomLevel]);

  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current);
      if (createTimeoutRef.current) clearTimeout(createTimeoutRef.current);
      markersRef.current.forEach(({ marker, root }) => {
        root.unmount();
        marker.destroy();
      });
      markersRef.current = [];
    };
  }, []);
};
