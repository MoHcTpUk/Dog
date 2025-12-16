import { useEffect, useRef } from "react";
import { useMapGL } from "../context/MapGLContext";
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

  // Инициализация карты только один раз
  useEffect(() => {
    if (!isLoaded || mapInstance) return;

    const container = document.getElementById("map-container");
    if (!container) {
      console.error("Map container not found!");
      return;
    }

    // Ждем пока контейнер получит размеры от CSS
    const waitForSize = () => {
      const { offsetWidth, offsetHeight } = container;

      if (offsetWidth > 0 && offsetHeight > 0) {
        console.log("✅ Контейнер получил размеры:", { offsetWidth, offsetHeight });
        initMap(container, center, zoom);
      } else {
        console.log("⏳ Контейнер еще без размеров, ждем...");
        requestAnimationFrame(waitForSize);
      }
    };

    requestAnimationFrame(waitForSize);
  }, [isLoaded, mapInstance, initMap, center, zoom]);

  // Callback когда карта готова
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
