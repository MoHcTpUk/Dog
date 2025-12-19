import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getClusterZoomLevel } from '@shared/utils/clustering.utils';
import type { MapInstance } from '@features/map/types/map.types';

interface UseMapZoomProps {
  mapInstance: MapInstance | null;
  initialZoom: number;
}

export const useMapZoom = ({ mapInstance, initialZoom }: UseMapZoomProps) => {
  const [currentZoom, setCurrentZoom] = useState(initialZoom);
  const currentZoomRef = useRef(initialZoom);
  const prevClusterZoomLevelRef = useRef<number>(getClusterZoomLevel(initialZoom));

  const clusterZoomLevel = useMemo(() => {
    return getClusterZoomLevel(currentZoom);
  }, [currentZoom]);

  useEffect(() => {
    if (!mapInstance) return;

    const handleZoomChange = () => {
      const newZoom = mapInstance.getZoom();
      currentZoomRef.current = newZoom;
      setCurrentZoom(newZoom);
    };

    mapInstance.on('zoomend', handleZoomChange);

    return () => {
      mapInstance.off('zoomend', handleZoomChange);
    };
  }, [mapInstance]);

  const handleClusterClick = useCallback((clusterCenter: [number, number]) => {
    if (!mapInstance) return;

    mapInstance.setCenter(clusterCenter);
    mapInstance.setZoom(Math.min(currentZoomRef.current + 2, 18));
  }, [mapInstance]);

  const hasClusteringChanged = useCallback(() => {
    const prevClusterZoomLevel = prevClusterZoomLevelRef.current;
    const changed = prevClusterZoomLevel !== clusterZoomLevel;
    prevClusterZoomLevelRef.current = clusterZoomLevel;
    return changed;
  }, [clusterZoomLevel]);

  return {
    currentZoom,
    clusterZoomLevel,
    handleClusterClick,
    hasClusteringChanged,
  };
};
