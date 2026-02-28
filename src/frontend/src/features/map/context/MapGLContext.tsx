import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { load } from "@2gis/mapgl";
import type { MapGLAPI, MapInstance } from "../types/map.types";
import type { Walk } from "@shared/types/walk";
import { MapGLContext, type Place } from "./context";
import type { PlaceCategory } from "@shared/types/place";
import { TWO_GIS_MAP_KEY } from "@shared/config/2gis.config";

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
  const [activeTab, setActiveTab] = useState<"walks" | "places">("walks");
  const onWalkClickRef = useRef<((walkId: string) => void) | null>(null);
  const onPlaceClickRef = useRef<((placeId: string) => void) | null>(null);
  const [walkCreationActive, setWalkCreationActive] = useState(false);

  const [locationPickerActive, setLocationPickerActive] = useState(false);
  const [locationPickerInitialCoords, setLocationPickerInitialCoords] = useState<[number, number] | null>(null);
  const locationPickerCallbackRef = useRef<((coords: [number, number], address: string) => void) | null>(null);

  const [placeCreationActive, setPlaceCreationActive] = useState(false);
  const [placesCategoryFilter, setPlacesCategoryFilter] = useState<PlaceCategory | null>(null);
  const [userAddedWalks, setUserAddedWalks] = useState<Walk[]>([]);
  const [userAddedPlaces, setUserAddedPlaces] = useState<Place[]>([]);

  // Загружаем только API карты при инициализации приложения (для быстрой загрузки)
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

    loadMapAPI();
  }, []);

  const initMap = useCallback(
    (container: HTMLElement, center: [number, number], zoom: number) => {
      console.log(
        "[MapGLContext] initMap called, container:",
        container,
        "mapInstanceRef:",
        !!mapInstanceRef.current,
      );

      // Если карта уже существует, не создаем новую
      if (mapInstanceRef.current) {
        console.log(
          "[MapGLContext] Map already initialized, skipping re-initialization",
        );
        return;
      }

      // Не создаем карту если API еще не загружен или уже идет инициализация
      if (isInitializingRef.current || !mapglRef.current) {
        console.log(
          "[MapGLContext] Skipping init - isInitializing:",
          isInitializingRef.current,
          "mapglAPI loaded:",
          !!mapglRef.current,
        );
        return;
      }

      try {
        console.log("[MapGLContext] Starting map initialization...");
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
          console.log("[MapGLContext] Map ready event fired");
          requestAnimationFrame(() => {
            const canvas = container.querySelector("canvas");
            if (canvas && (canvas.width === 0 || canvas.height === 0)) {
              console.log(
                "[MapGLContext] Canvas size is 0, calling invalidateSize",
              );
              map.invalidateSize?.();
            }
          });

          console.log("[MapGLContext] Setting isMapReady to true");
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
    if (mapInstanceRef.current) {
      mapInstanceRef.current.destroy();
      mapInstanceRef.current = null;
      setIsMapReady(false);
    }
  }, []);

  const setWalkClickHandler = useCallback(
    (handler: ((walkId: string) => void) | null) => {
      onWalkClickRef.current = handler;
    },
    [],
  );

  const onWalkClick = useCallback((walkId: string) => {
    onWalkClickRef.current?.(walkId);
  }, []);

  const setPlaceClickHandler = useCallback(
    (handler: ((placeId: string) => void) | null) => {
      onPlaceClickRef.current = handler;
    },
    [],
  );

  const onPlaceClick = useCallback((placeId: string) => {
    onPlaceClickRef.current?.(placeId);
  }, []);

  const startWalkCreation = useCallback(() => {
    setWalkCreationActive(true);
  }, []);

  const cancelWalkCreation = useCallback(() => {
    setWalkCreationActive(false);
  }, []);

  const startLocationPicker = useCallback((coords: [number, number], onConfirm: (coords: [number, number], address: string) => void) => {
    locationPickerCallbackRef.current = onConfirm;
    setLocationPickerInitialCoords(coords);
    setLocationPickerActive(true);
  }, []);

  const cancelLocationPicker = useCallback(() => {
    setLocationPickerActive(false);
    setLocationPickerInitialCoords(null);
    locationPickerCallbackRef.current = null;
  }, []);

  const confirmLocationPicker = useCallback((coords: [number, number], address: string) => {
    locationPickerCallbackRef.current?.(coords, address);
    setLocationPickerActive(false);
    setLocationPickerInitialCoords(null);
    locationPickerCallbackRef.current = null;
  }, []);

  const startPlaceCreation = useCallback(() => {
    setPlaceCreationActive(true);
  }, []);

  const cancelPlaceCreation = useCallback(() => {
    setPlaceCreationActive(false);
  }, []);

  const addUserWalk = useCallback((walk: Walk) => {
    setUserAddedWalks((prev) => [walk, ...prev]);
  }, []);

  const addUserPlace = useCallback((place: Place) => {
    setUserAddedPlaces((prev) => [...prev, place]);
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
      onPlaceClick,
      activeTab,

      setDisplayedWalks,
      setDisplayedPlaces,
      setWalkClickHandler,
      setPlaceClickHandler,
      setActiveTab,

      walkCreationActive,
      startWalkCreation,
      cancelWalkCreation,

      locationPickerActive,
      locationPickerInitialCoords,
      startLocationPicker,
      cancelLocationPicker,
      confirmLocationPicker,

      placeCreationActive,
      startPlaceCreation,
      cancelPlaceCreation,

      placesCategoryFilter,
      setPlacesCategoryFilter,
      userAddedWalks,
      addUserWalk,
      userAddedPlaces,
      addUserPlace,
    }),
    [
      isLoaded,
      isMapReady,
      initMap,
      destroyMap,
      displayedWalks,
      displayedPlaces,
      onWalkClick,
      onPlaceClick,
      activeTab,
      setWalkClickHandler,
      setPlaceClickHandler,
      walkCreationActive,
      startWalkCreation,
      cancelWalkCreation,
      locationPickerActive,
      locationPickerInitialCoords,
      startLocationPicker,
      cancelLocationPicker,
      confirmLocationPicker,
      placeCreationActive,
      startPlaceCreation,
      cancelPlaceCreation,
      placesCategoryFilter,
      setPlacesCategoryFilter,
      userAddedWalks,
      addUserWalk,
      userAddedPlaces,
      addUserPlace,
    ],
  );

  return (
    <MapGLContext.Provider value={contextValue}>
      {children}
    </MapGLContext.Provider>
  );
};
