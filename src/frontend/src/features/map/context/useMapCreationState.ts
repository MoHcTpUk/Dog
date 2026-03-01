import { useCallback, useMemo, useRef, useState } from "react";
import type { Walk } from "@shared/types/walk";
import type { MapPlace, PlaceCategory } from "@shared/types/place";
import type { MapLocationPickerConfirmHandler } from "./context.types";

export const useMapCreationState = () => {
  const [walkCreationActive, setWalkCreationActive] = useState(false);
  const [locationPickerActive, setLocationPickerActive] = useState(false);
  const [locationPickerInitialCoords, setLocationPickerInitialCoords] =
    useState<[number, number] | null>(null);
  const [placeCreationActive, setPlaceCreationActive] = useState(false);
  const [placesCategoryFilter, setPlacesCategoryFilter] =
    useState<PlaceCategory | null>(null);
  const [userAddedWalks, setUserAddedWalks] = useState<Walk[]>([]);
  const [userAddedPlaces, setUserAddedPlaces] = useState<MapPlace[]>([]);

  const locationPickerCallbackRef =
    useRef<MapLocationPickerConfirmHandler | null>(null);

  const startWalkCreation = useCallback(() => {
    setWalkCreationActive(true);
  }, []);

  const cancelWalkCreation = useCallback(() => {
    setWalkCreationActive(false);
  }, []);

  const startLocationPicker = useCallback(
    (coords: [number, number], onConfirm: MapLocationPickerConfirmHandler) => {
      locationPickerCallbackRef.current = onConfirm;
      setLocationPickerInitialCoords(coords);
      setLocationPickerActive(true);
    },
    [],
  );

  const resetLocationPicker = useCallback(() => {
    setLocationPickerActive(false);
    setLocationPickerInitialCoords(null);
    locationPickerCallbackRef.current = null;
  }, []);

  const cancelLocationPicker = useCallback(() => {
    resetLocationPicker();
  }, [resetLocationPicker]);

  const confirmLocationPicker = useCallback(
    (coords: [number, number], address: string) => {
      locationPickerCallbackRef.current?.(coords, address);
      resetLocationPicker();
    },
    [resetLocationPicker],
  );

  const startPlaceCreation = useCallback(() => {
    setPlaceCreationActive(true);
  }, []);

  const cancelPlaceCreation = useCallback(() => {
    setPlaceCreationActive(false);
  }, []);

  const addUserWalk = useCallback((walk: Walk) => {
    setUserAddedWalks((prev) => [walk, ...prev]);
  }, []);

  const addUserPlace = useCallback((place: MapPlace) => {
    setUserAddedPlaces((prev) => [...prev, place]);
  }, []);

  return useMemo(
    () => ({
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
      addUserPlace,
      addUserWalk,
      cancelLocationPicker,
      cancelPlaceCreation,
      cancelWalkCreation,
      confirmLocationPicker,
      locationPickerActive,
      locationPickerInitialCoords,
      placeCreationActive,
      placesCategoryFilter,
      startLocationPicker,
      startPlaceCreation,
      startWalkCreation,
      userAddedPlaces,
      userAddedWalks,
      walkCreationActive,
    ],
  );
};
