import { useCallback, useMemo, useRef, useState } from "react";
import type { Walk } from "@shared/types/walk";
import type { MapPlace } from "@shared/types/place";
import type { MapTab } from "./context.types";

export const useMapDisplayState = () => {
  const [displayedWalks, setDisplayedWalks] = useState<Walk[]>([]);
  const [displayedPlaces, setDisplayedPlaces] = useState<MapPlace[]>([]);
  const [activeTab, setActiveTab] = useState<MapTab>("walks");

  const onWalkClickRef = useRef<((walkId: string) => void) | null>(null);
  const onPlaceClickRef = useRef<((placeId: string) => void) | null>(null);

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

  return useMemo(
    () => ({
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
    }),
    [
      activeTab,
      displayedPlaces,
      displayedWalks,
      onPlaceClick,
      onWalkClick,
      setPlaceClickHandler,
      setWalkClickHandler,
    ],
  );
};
