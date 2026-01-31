import { createContext } from "react";
import type { MapGLAPI, MapInstance } from "../types/map.types";
import type { Walk } from "@shared/types/walk";

export interface Place {
  id: string;
  name: string;
  coordinates: [number, number];
  dogFriendly: boolean;
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
  activeTab: 'walks' | 'places';

  setDisplayedWalks: (walks: Walk[]) => void;
  setDisplayedPlaces: (places: Place[]) => void;
  setWalkClickHandler: (handler: ((walkId: string) => void) | null) => void;
  setActiveTab: (tab: 'walks' | 'places') => void;
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
  activeTab: 'walks',

  setDisplayedWalks: () => {},
  setDisplayedPlaces: () => {},
  setWalkClickHandler: () => {},
  setActiveTab: () => {},
});
