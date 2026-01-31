import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { load } from "@2gis/mapgl";
import type { MapGLAPI, MapInstance } from "../types/map.types";
import type { Walk } from "@shared/types/walk";
import { MapGLContext, type Place } from "./context";

const MAP_API_KEY = "f9c14a07-af77-4cd7-8a71-f9adf475db9b";

export const MapGLProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const mapglRef = useRef<MapGLAPI>(null);
  const mapInstanceRef = useRef<MapInstance>(null);
  const isInitializingRef = useRef(false);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const [displayedWalks, setDisplayedWalks] = useState<Walk[]>([]);
  const [displayedPlaces, setDisplayedPlaces] = useState<Place[]>([]);
  const [activeTab, setActiveTab] = useState<'walks' | 'places'>('walks');
  const onWalkClickRef = useRef<((walkId: string) => void) | null>(null);

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
    console.log('[MapGLContext] initMap called, container:', container, 'mapInstanceRef:', !!mapInstanceRef.current);

    // Если карта уже существует, не создаем новую
    if (mapInstanceRef.current) {
      console.log('[MapGLContext] Map already initialized, skipping re-initialization');
      return;
    }

    // Не создаем карту если API еще не загружен или уже идет инициализация
    if (isInitializingRef.current || !mapglRef.current) {
      console.log('[MapGLContext] Skipping init - isInitializing:', isInitializingRef.current, 'mapglAPI loaded:', !!mapglRef.current);
      return;
    }

    try {
      console.log('[MapGLContext] Starting map initialization...');
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
        console.log('[MapGLContext] Map ready event fired');
        requestAnimationFrame(() => {
          const canvas = container.querySelector('canvas');
          if (canvas && (canvas.width === 0 || canvas.height === 0)) {
            console.log('[MapGLContext] Canvas size is 0, calling invalidateSize');
            map.invalidateSize?.();
          }
        });

        console.log('[MapGLContext] Setting isMapReady to true');
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

  const setWalkClickHandler = useCallback((handler: ((walkId: string) => void) | null) => {
    onWalkClickRef.current = handler;
  }, []);

  const onWalkClick = useCallback((walkId: string) => {
    onWalkClickRef.current?.(walkId);
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

      displayedWalks,
      displayedPlaces,
      onWalkClick,
      activeTab,

      setDisplayedWalks,
      setDisplayedPlaces,
      setWalkClickHandler,
      setActiveTab,
    }),
    [isLoaded, isMapReady, initMap, destroyMap, displayedWalks, displayedPlaces, onWalkClick, activeTab, setWalkClickHandler]
  );

  return (
    <MapGLContext.Provider value={contextValue}>
      {children}
    </MapGLContext.Provider>
  );
};
