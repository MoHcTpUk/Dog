import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { load } from "@2gis/mapgl";

const MAP_API_KEY = "a5ea882e-e0dd-485c-ab08-6e702a9b8c49";

interface MapGLContextValue {
  mapglAPI: any;
  isLoaded: boolean;
  isMapReady: boolean;
  mapInstance: any;
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
  // Refs для персистентного хранения (не вызывают ре-рендеры)
  const mapglRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const isInitializingRef = useRef(false);

  // State только для триггера ре-рендеров при изменении статусов
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Загрузка API только один раз
  useEffect(() => {
    load()
      .then((api) => {
        mapglRef.current = api;
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error("Failed to load MapGL API:", error);
        setIsLoaded(false);
      });
  }, []);

  const initMap = useCallback((container: HTMLElement, center: [number, number], zoom: number) => {
    // Если карта уже создана - просто центрируем
    if (mapInstanceRef.current) {
      console.log("Карта уже создана, центрируем...");
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
      return;
    }

    // Защита от race conditions
    if (isInitializingRef.current) return;
    if (!mapglRef.current) return;

    console.log("Инициализация карты...", {
      container,
      containerSize: { width: container.offsetWidth, height: container.offsetHeight },
      center,
      zoom
    });

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
        console.log("✅ Карта готова!");

        // Принудительный пересчет размеров canvas
        requestAnimationFrame(() => {
          const canvas = container.querySelector('canvas');
          if (canvas) {
            const { width, height } = container.getBoundingClientRect();
            console.log("📐 Размеры контейнера:", { width, height });
            console.log("📐 Размеры canvas:", {
              width: canvas.width,
              height: canvas.height,
              styleWidth: canvas.style.width,
              styleHeight: canvas.style.height
            });

            // Если canvas имеет 0x0, пересоздаем размеры
            if (canvas.width === 0 || canvas.height === 0) {
              console.log("⚠️ Canvas имеет нулевые размеры, обновляем...");
              map.invalidateSize?.();
            }
          }
        });

        setIsMapReady(true);
        isInitializingRef.current = false;
      });

      map.on("error", (error: any) => {
        console.error("❌ Ошибка карты:", error);
      });
    } catch (error) {
      console.error("❌ Failed to initialize map:", error);
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

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      destroyMap();
    };
  }, [destroyMap]);

  return (
    <MapGLContext.Provider
      value={{
        mapglAPI: mapglRef.current,
        isLoaded,
        isMapReady,
        mapInstance: mapInstanceRef.current,
        initMap,
        destroyMap,
      }}
    >
      {children}
    </MapGLContext.Provider>
  );
};
