import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getClusterZoomLevel } from '@shared/utils/clustering.utils';
import type { MapInstance } from '@features/map/types/map.types';

interface UseMapZoomProps {
  mapInstance: MapInstance | null;
  initialZoom: number;
}

export const useMapZoom = ({ mapInstance, initialZoom }: UseMapZoomProps) => {
  const [currentZoom, setCurrentZoom] = useState(initialZoom);
  const prevClusterZoomLevelRef = useRef<number>(getClusterZoomLevel(initialZoom));

  // Вычисляем дискретный уровень зума для кластеризации
  const clusterZoomLevel = useMemo(() => {
    return getClusterZoomLevel(currentZoom);
  }, [currentZoom]);

  // Отслеживание изменения зума
  useEffect(() => {
    if (!mapInstance) return;

    const handleZoomChange = () => {
      const newZoom = mapInstance.getZoom();
      setCurrentZoom(newZoom);
    };

    mapInstance.on('zoomend', handleZoomChange);

    return () => {
      mapInstance.off('zoomend', handleZoomChange);
    };
  }, [mapInstance]);

  // Обработчик клика на кластер
  const handleClusterClick = useCallback((clusterCenter: [number, number]) => {
    if (!mapInstance) return;

    mapInstance.setCenter(clusterCenter);
    mapInstance.setZoom(Math.min(currentZoom + 2, 18));
  }, [mapInstance, currentZoom]);

  // Проверка изменения уровня кластеризации
  const hasClusteringChanged = () => {
    const prevClusterZoomLevel = prevClusterZoomLevelRef.current;
    const changed = prevClusterZoomLevel !== clusterZoomLevel;
    prevClusterZoomLevelRef.current = clusterZoomLevel;
    return changed;
  };

  return {
    currentZoom,
    clusterZoomLevel,
    handleClusterClick,
    hasClusteringChanged,
  };
};
