import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getClusterZoomLevel } from "@shared/utils/clustering.utils";
import type { MapInstance } from "../types/map.types";

interface UseMapZoomProps {
  mapInstance: MapInstance | null;
  initialZoom: number;
}

export const useMapZoom = ({ mapInstance, initialZoom }: UseMapZoomProps) => {
  const [currentZoom, setCurrentZoom] = useState(initialZoom);
  const currentZoomRef = useRef(initialZoom);

  const clusterZoomLevel = useMemo(
    () => getClusterZoomLevel(currentZoom),
    [currentZoom],
  );

  useEffect(() => {
    if (!mapInstance) return;

    const handleZoomChange = () => {
      const newZoom = mapInstance.getZoom();
      currentZoomRef.current = newZoom;
      setCurrentZoom(newZoom);
    };

    mapInstance.on("zoomend", handleZoomChange);

    return () => {
      mapInstance.off("zoomend", handleZoomChange);
    };
  }, [mapInstance]);

  const handleClusterClick = useCallback(
    (clusterCenter: [number, number]) => {
      if (!mapInstance) return;

      mapInstance.setCenter(clusterCenter);
      mapInstance.setZoom(Math.min(currentZoomRef.current + 2, 18));
    },
    [mapInstance],
  );

  return {
    currentZoom,
    clusterZoomLevel,
    handleClusterClick,
  };
};
