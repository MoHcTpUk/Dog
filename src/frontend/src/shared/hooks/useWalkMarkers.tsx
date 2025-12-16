import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import type { Walk } from '@shared/types/walk';
import { clusterWalks, isCluster } from '@shared/utils/clustering.utils';
import { WalkPin, WalkPinCluster } from '@shared/ui/WalkPin';
import type { MapInstance, MapGLAPI, MapMarker } from '@features/map/types/map.types';

interface UseWalkMarkersProps {
  mapInstance: MapInstance | null;
  mapglAPI: MapGLAPI | null;
  walks: Walk[];
  clusterZoomLevel: number;
  hasClusteringChanged: () => boolean;
  onClusterClick: (center: [number, number]) => void;
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
}: UseWalkMarkersProps) => {
  const walkMarkersRef = useRef<WalkMarkerData[]>([]);

  useEffect(() => {
    if (!mapInstance || !mapglAPI) {
      console.log('⚠️ Карта или API не готовы для маркеров прогулок');
      return;
    }

    // Проверяем, изменился ли уровень кластеризации
    if (!hasClusteringChanged() && walkMarkersRef.current.length > 0) {
      console.log('⏭️ Пропускаем пересоздание маркеров - уровень кластеризации не изменился');
      return;
    }

    console.log('🚶 Пересоздание маркеров прогулок:', {
      walkCount: walks.length,
      clusterZoomLevel,
    });

    console.log('📍 Старые маркеры:', walkMarkersRef.current.map(m => m.id));

    const clusteredItems = clusterWalks(walks, clusterZoomLevel);

    console.log('🆕 Новые элементы:', clusteredItems.map(item => ({ id: item.id, isCluster: isCluster(item) })));

    const newItemsMap = new Map(clusteredItems.map(item => [item.id, item]));
    const oldItemsMap = new Map(walkMarkersRef.current.map(m => [m.id, m]));

    const markersToRemove: typeof walkMarkersRef.current = [];
    const markersToKeep: typeof walkMarkersRef.current = [];

    walkMarkersRef.current.forEach((markerData) => {
      if (newItemsMap.has(markerData.id)) {
        markersToKeep.push(markerData);
      } else {
        markersToRemove.push(markerData);
      }
    });

    console.log('❌ Удаляем:', markersToRemove.map(m => m.id));
    console.log('✅ Сохраняем:', markersToKeep.map(m => m.id));

    // Запускаем анимацию исчезновения
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

    // Удаляем старые маркеры после анимации
    const cleanupTimeout = setTimeout(() => {
      markersToRemove.forEach(({ marker, root }) => {
        root.unmount();
        marker.destroy();
      });
    }, 350);

    walkMarkersRef.current = markersToKeep;

    const itemsToCreate = clusteredItems.filter(item => !oldItemsMap.has(item.id));

    if (itemsToCreate.length > 0) {
      const createTimeout = setTimeout(() => {
        itemsToCreate.forEach((item) => {
          const markerElement = document.createElement('div');
          const root = createRoot(markerElement);

          if (isCluster(item)) {
            root.render(
              <WalkPinCluster
                dogAvatars={item.dogAvatars}
                walkCount={item.walkCount}
                onClick={() => onClusterClick(item.center)}
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

        console.log(`🎯 Создано новых маркеров: ${itemsToCreate.length}, сохранено: ${markersToKeep.length}`);
      }, 180);

      return () => {
        clearTimeout(cleanupTimeout);
        clearTimeout(createTimeout);
      };
    }

    return () => {
      clearTimeout(cleanupTimeout);
    };
  }, [walks, mapglAPI, mapInstance, clusterZoomLevel, hasClusteringChanged, onClusterClick]);

  // Очистка всех маркеров при размонтировании
  useEffect(() => {
    return () => {
      walkMarkersRef.current.forEach(({ marker, root }) => {
        root.unmount();
        marker.destroy();
      });
      walkMarkersRef.current = [];
    };
  }, []);
};
