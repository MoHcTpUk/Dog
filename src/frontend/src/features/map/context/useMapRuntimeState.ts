import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { load } from "@2gis/mapgl";
import type { MapGLAPI, MapInstance } from "../types/map.types";
import { TWO_GIS_MAP_KEY } from "@shared/config/2gis.config";

export const useMapRuntimeState = () => {
  const mapglRef = useRef<MapGLAPI>(null);
  const mapInstanceRef = useRef<MapInstance>(null);
  const isInitializingRef = useRef(false);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    const loadMapAPI = async () => {
      try {
        const api = await load();
        mapglRef.current = api;
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load map API:", error);
        setIsLoaded(false);
      }
    };

    void loadMapAPI();
  }, []);

  const initMap = useCallback(
    (container: HTMLElement, center: [number, number], zoom: number) => {
      if (mapInstanceRef.current) {
        return;
      }

      if (isInitializingRef.current || !mapglRef.current) {
        return;
      }

      try {
        isInitializingRef.current = true;

        const map = new mapglRef.current.Map(container, {
          center,
          zoom,
          key: TWO_GIS_MAP_KEY,
          rotationControl: false,
          zoomControl: false,
          trafficControl: false,
          style: "c080bb6a-8134-4993-93a1-5b4d8c36a59b",
        });

        mapInstanceRef.current = map;

        map.on("ready", () => {
          requestAnimationFrame(() => {
            const canvas = container.querySelector("canvas");
            if (canvas && (canvas.width === 0 || canvas.height === 0)) {
              map.invalidateSize?.();
            }
          });

          setIsMapReady(true);
          isInitializingRef.current = false;
        });
      } catch (error) {
        console.error("Failed to init map:", error);
        isInitializingRef.current = false;
      }
    },
    [],
  );

  const destroyMap = useCallback(() => {
    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.destroy();
    mapInstanceRef.current = null;
    setIsMapReady(false);
  }, []);

  useEffect(() => {
    return () => {
      destroyMap();
    };
  }, [destroyMap]);

  return useMemo(
    () => ({
      mapglAPI: mapglRef.current,
      isLoaded,
      isMapReady,
      mapInstance: mapInstanceRef.current,
      initMap,
      destroyMap,
    }),
    [destroyMap, initMap, isLoaded, isMapReady],
  );
};
