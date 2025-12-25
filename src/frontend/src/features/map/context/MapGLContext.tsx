import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { load } from "@2gis/mapgl";
import type { MapGLAPI, MapInstance } from "../types/map.types";

const MAP_API_KEY = "a5ea882e-e0dd-485c-ab08-6e702a9b8c49";

interface MapGLContextValue {
  mapglAPI: MapGLAPI;
  isLoaded: boolean;
  isMapReady: boolean;
  mapInstance: MapInstance;
  initMap: (container: HTMLElement, center: [number, number], zoom: number) => void;
  destroyMap: () => void;
}

const MapGLContext = createContext<MapGLContextValue>({
  mapglAPI: null,
  isLoaded: false,
  isMapReady: false,
  mapInstance: null,
  initMap: () => {},
  destroyMap: () => {},
});

export const useMapGL = () => useContext(MapGLContext);

export const MapGLProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const mapglRef = useRef<MapGLAPI>(null);
  const mapInstanceRef = useRef<MapInstance>(null);
  const isInitializingRef = useRef(false);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Загружаем только API карты при инициализации приложения (для быстрой загрузки)
  useEffect(() => {
    const loadMapAPI = async () => {
      try {
        const api = await load();
        mapglRef.current = api;
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load map API:', error);
        setIsLoaded(false);
      }
    };

    loadMapAPI();
  }, []);

  const initMap = useCallback((container: HTMLElement, center: [number, number], zoom: number) => {
    // Если карта уже существует, просто обновляем параметры
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
      return;
    }

    // Не создаем карту если API еще не загружен или уже идет инициализация
    if (isInitializingRef.current || !mapglRef.current) return;

    try {
      isInitializingRef.current = true;

      const map = new mapglRef.current.Map(container, {
        center,
        zoom,
        key: MAP_API_KEY,
        rotationControl: false,
        zoomControl: false,
        trafficControl: false,
        style: 'c080bb6a-8134-4993-93a1-5b4d8c36a59b',
      });

      mapInstanceRef.current = map;

      map.on("ready", () => {
        requestAnimationFrame(() => {
          const canvas = container.querySelector('canvas');
          if (canvas && (canvas.width === 0 || canvas.height === 0)) {
            map.invalidateSize?.();
          }
        });

        setIsMapReady(true);
        isInitializingRef.current = false;
      });
    } catch (error) {
      console.error('Failed to init map:', error);
      isInitializingRef.current = false;
    }
  }, []);

  const destroyMap = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.destroy();
      mapInstanceRef.current = null;
      setIsMapReady(false);
    }
  }, []);

  // Уничтожаем карту только при размонтировании провайдера
  useEffect(() => {
    return () => {
      destroyMap();
    };
  }, [destroyMap]);

  const contextValue = useMemo(
    () => ({
      mapglAPI: mapglRef.current,
      isLoaded,
      isMapReady,
      mapInstance: mapInstanceRef.current,
      initMap,
      destroyMap,
    }),
    [isLoaded, isMapReady, initMap, destroyMap]
  );

  return (
    <MapGLContext.Provider value={contextValue}>
      {children}
    </MapGLContext.Provider>
  );
};
