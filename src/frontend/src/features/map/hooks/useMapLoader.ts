import { useEffect, useRef } from "react";
import { useMapGL } from "../context";
import type { MapInstance, MapGLAPI } from "../types/map.types";

interface UseMapLoaderProps {
  center?: [number, number];
  zoom?: number;
  onMapReady?: (map: MapInstance, mapglAPI: MapGLAPI) => void;
}

export const useMapLoader = ({
  center = [37.573856, 55.751574],
  zoom = 13,
  onMapReady,
}: UseMapLoaderProps = {}) => {
  const { mapglAPI, isLoaded, isMapReady, mapInstance, initMap } = useMapGL();
  const onReadyCalledRef = useRef(false);
  const centerRef = useRef(center);
  const zoomRef = useRef(zoom);

  centerRef.current = center;
  zoomRef.current = zoom;

  useEffect(() => {
    if (!isLoaded || mapInstance) return;

    const container = document.getElementById("map-container");
    if (!container) return;

    initMap(container, centerRef.current, zoomRef.current);
  }, [isLoaded, mapInstance, initMap]);

  useEffect(() => {
    if (isMapReady && mapInstance && onMapReady && !onReadyCalledRef.current) {
      onMapReady(mapInstance, mapglAPI);
      onReadyCalledRef.current = true;
    }
  }, [isMapReady, mapInstance, mapglAPI, onMapReady]);

  return {
    mapglAPI,
    mapInstance,
    isLoading: !isMapReady,
  };
};
