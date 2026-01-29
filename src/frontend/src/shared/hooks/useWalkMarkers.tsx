import { useEffect, useRef, useMemo } from 'react';
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
  hasClusteringChanged: () => boolean;
  onClusterClick: (center: [number, number]) => void;
  onWalkClick?: (walkId: string) => void;
  isPaused?: boolean;
}

interface WalkMarkerData {
  marker: MapMarker;
  root: Root;
  id: string;
}

export const useWalkMarkers = ({
  mapInstance,
  mapglAPI,
  walks,
  clusterZoomLevel,
  hasClusteringChanged,
  onClusterClick,
  onWalkClick,
  isPaused = false,
}: UseWalkMarkersProps) => {
  const walkMarkersRef = useRef<WalkMarkerData[]>([]);
  const onClusterClickRef = useRef(onClusterClick);
  const onWalkClickRef = useRef(onWalkClick);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const createTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  onClusterClickRef.current = onClusterClick;
  onWalkClickRef.current = onWalkClick;

  const shouldUpdate = useMemo(() => {
    return hasClusteringChanged();
  }, [hasClusteringChanged]);

  useEffect(() => {
    if (isPaused) return;

    if (!mapInstance || !mapglAPI) return;

    // Всегда обновляем если количество walks изменилось с ненулевого на ноль или наоборот
    const hasWalksCountChanged = (walks.length === 0) !== (walkMarkersRef.current.length === 0);
    if (!shouldUpdate && !hasWalksCountChanged && walkMarkersRef.current.length > 0) return;

    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }
    if (createTimeoutRef.current) {
      clearTimeout(createTimeoutRef.current);
    }

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
      const element = marker.getContent?.() || marker._el;
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
              anchor: [60, 63],
            });

            walkMarkersRef.current.push({ marker, root, id: item.id });
          }
        });
      }, 180);
    }

    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
      if (createTimeoutRef.current) {
        clearTimeout(createTimeoutRef.current);
      }
    };
  }, [isPaused, walks, mapglAPI, mapInstance, clusterZoomLevel, shouldUpdate]);

  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
      if (createTimeoutRef.current) {
        clearTimeout(createTimeoutRef.current);
      }
      walkMarkersRef.current.forEach(({ marker, root }) => {
        root.unmount();
        marker.destroy();
      });
      walkMarkersRef.current = [];
    };
  }, []);
};
