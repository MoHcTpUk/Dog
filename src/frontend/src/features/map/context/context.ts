import { createContext } from "react";
import type { MapGLAPI, MapInstance } from "../types/map.types";
import type { Walk } from "@shared/types/walk";
import type { PlaceCategory } from "@shared/types/place";

export type { PlaceCategory };

export interface Place {
  id: string;
  name: string;
  coordinates: [number, number];
  dogFriendly: boolean;
  category?: PlaceCategory;
}

interface MapGLContextValue {
  mapglAPI: MapGLAPI;
  isLoaded: boolean;
  isMapReady: boolean;
  mapInstance: MapInstance;
  initMap: (container: HTMLElement, center: [number, number], zoom: number) => void;
  destroyMap: () => void;

  displayedWalks: Walk[];
  displayedPlaces: Place[];
  onWalkClick: ((walkId: string) => void) | null;
  onPlaceClick: ((placeId: string) => void) | null;
  activeTab: 'walks' | 'places';

  setDisplayedWalks: (walks: Walk[]) => void;
  setDisplayedPlaces: (places: Place[]) => void;
  setWalkClickHandler: (handler: ((walkId: string) => void) | null) => void;
  setPlaceClickHandler: (handler: ((placeId: string) => void) | null) => void;
  setActiveTab: (tab: 'walks' | 'places') => void;

  walkCreationActive: boolean;
  startWalkCreation: () => void;
  cancelWalkCreation: () => void;

  locationPickerActive: boolean;
  locationPickerInitialCoords: [number, number] | null;
  startLocationPicker: (coords: [number, number], onConfirm: (coords: [number, number], address: string) => void) => void;
  cancelLocationPicker: () => void;
  confirmLocationPicker: (coords: [number, number], address: string) => void;

  placeCreationActive: boolean;
  startPlaceCreation: () => void;
  cancelPlaceCreation: () => void;

  placesCategoryFilter: PlaceCategory | null;
  setPlacesCategoryFilter: (cat: PlaceCategory | null) => void;
  userAddedWalks: Walk[];
  addUserWalk: (walk: Walk) => void;
  userAddedPlaces: Place[];
  addUserPlace: (place: Place) => void;
}

export const MapGLContext = createContext<MapGLContextValue>({
  mapglAPI: null,
  isLoaded: false,
  isMapReady: false,
  mapInstance: null,
  initMap: () => {},
  destroyMap: () => {},

  displayedWalks: [],
  displayedPlaces: [],
  onWalkClick: null,
  onPlaceClick: null,
  activeTab: 'walks',

  setDisplayedWalks: () => {},
  setDisplayedPlaces: () => {},
  setWalkClickHandler: () => {},
  setPlaceClickHandler: () => {},
  setActiveTab: () => {},

  walkCreationActive: false,
  startWalkCreation: () => {},
  cancelWalkCreation: () => {},

  locationPickerActive: false,
  locationPickerInitialCoords: null,
  startLocationPicker: () => {},
  cancelLocationPicker: () => {},
  confirmLocationPicker: () => {},

  placeCreationActive: false,
  startPlaceCreation: () => {},
  cancelPlaceCreation: () => {},

  placesCategoryFilter: null,
  setPlacesCategoryFilter: () => {},
  userAddedWalks: [],
  addUserWalk: () => {},
  userAddedPlaces: [],
  addUserPlace: () => {},
});
