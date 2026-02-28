import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import type { Walk } from '@shared/types/walk';
import { clusterWalks, isCluster } from '@shared/utils/clustering.utils';
import { WalkPin, WalkPinCluster } from '@entities/walk';
import type { MapInstance, MapGLAPI, MapMarker } from '@features/map/types/map.types';

interface UseWalkMarkersProps {
  mapInstance: MapInstance | null;
  mapglAPI: MapGLAPI | null;
  walks: Walk[];
  clusterZoomLevel: number;
  onClusterClick: (center: [number, number]) => void;
  onWalkClick?: (walkId: string) => void;
  isPaused?: boolean;
}

interface WalkMarkerData {
  marker: MapMarker;
  root: Root;
  id: string;
}

const getMarkerElement = (marker: MapMarker): HTMLElement | null => {
  return marker.getContent?.() || marker._el || null;
};

export const useWalkMarkers = ({
  mapInstance,
  mapglAPI,
  walks,
  clusterZoomLevel,
  onClusterClick,
  onWalkClick,
  isPaused = false,
}: UseWalkMarkersProps) => {
  const walkMarkersRef = useRef<WalkMarkerData[]>([]);
  const onClusterClickRef = useRef(onClusterClick);
  const onWalkClickRef = useRef(onWalkClick);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const createTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const prevClusterZoomLevelRef = useRef(clusterZoomLevel);

  onClusterClickRef.current = onClusterClick;
  onWalkClickRef.current = onWalkClick;

  useEffect(() => {
    if (isPaused) return;
    if (!mapInstance || !mapglAPI) return;

    const hasClusteringChanged = prevClusterZoomLevelRef.current !== clusterZoomLevel;
    prevClusterZoomLevelRef.current = clusterZoomLevel;

    const hasWalksCountChanged = (walks.length === 0) !== (walkMarkersRef.current.length === 0);
    if (!hasClusteringChanged && !hasWalksCountChanged && walkMarkersRef.current.length > 0) return;

    if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current);
    if (createTimeoutRef.current) clearTimeout(createTimeoutRef.current);

    const clusteredItems = clusterWalks(walks, clusterZoomLevel);

    const newItemsMap = new Map(clusteredItems.map(item => [item.id, item]));
    const oldItemsMap = new Map(walkMarkersRef.current.map(m => [m.id, m]));

    const markersToRemove: WalkMarkerData[] = [];
    const markersToKeep: WalkMarkerData[] = [];

    walkMarkersRef.current.forEach((markerData) => {
      if (newItemsMap.has(markerData.id)) {
        markersToKeep.push(markerData);
      } else {
        markersToRemove.push(markerData);
      }
    });

    markersToRemove.forEach(({ marker }) => {
      const element = getMarkerElement(marker);
      if (element) {
        const walkPinContainer = element.querySelector('.walk-pin-container');
        const clusterContainer = element.querySelector('.cluster-container');

        if (walkPinContainer) {
          walkPinContainer.classList.remove('walk-pin-enter');
          walkPinContainer.classList.add('walk-pin-exit');
        } else if (clusterContainer) {
          clusterContainer.classList.remove('cluster-enter');
          clusterContainer.classList.add('cluster-exit');
        }
      }
    });

    cleanupTimeoutRef.current = setTimeout(() => {
      markersToRemove.forEach(({ marker, root }) => {
        root.unmount();
        marker.destroy();
      });
    }, 350);

    walkMarkersRef.current = markersToKeep;

    const itemsToCreate = clusteredItems.filter(item => !oldItemsMap.has(item.id));

    if (itemsToCreate.length > 0) {
      createTimeoutRef.current = setTimeout(() => {
        itemsToCreate.forEach((item) => {
          const markerElement = document.createElement('div');
          const root = createRoot(markerElement);

          if (isCluster(item)) {
            root.render(
              <WalkPinCluster
                dogAvatars={item.dogAvatars}
                walkCount={item.walkCount}
                onClick={() => onClusterClickRef.current(item.center)}
                isAnimating={true}
              />
            );

            const marker = new mapglAPI.HtmlMarker(mapInstance, {
              coordinates: item.center,
              html: markerElement,
              anchor: [0, 0],
            });

            walkMarkersRef.current.push({ marker, root, id: item.id });
          } else {
            root.render(
              <WalkPin
                dogAvatar={item.dogAvatar}
                time={item.time}
                dogCount={item.dogCount}
                status={item.status}
                onClick={() => onWalkClickRef.current?.(item.id)}
                isAnimating={true}
              />
            );

            const marker = new mapglAPI.HtmlMarker(mapInstance, {
              coordinates: item.coordinates,
              html: markerElement,
              // Anchor the marker at the walk pin's bottom center so the tip
              // stays exactly on the selected map coordinates regardless of pin width.
              anchor: [0, 0],
            });

            walkMarkersRef.current.push({ marker, root, id: item.id });
          }
        });
      }, 180);
    }

    return () => {
      if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current);
      if (createTimeoutRef.current) clearTimeout(createTimeoutRef.current);
    };
  }, [isPaused, walks, mapglAPI, mapInstance, clusterZoomLevel]);

  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current);
      if (createTimeoutRef.current) clearTimeout(createTimeoutRef.current);
      walkMarkersRef.current.forEach(({ marker, root }) => {
        root.unmount();
        marker.destroy();
      });
      walkMarkersRef.current = [];
    };
  }, []);
};
