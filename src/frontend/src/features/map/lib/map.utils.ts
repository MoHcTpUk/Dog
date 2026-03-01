import { Geolocation } from "@capacitor/geolocation";
import { reverseGeocode } from "@shared/utils/reverseGeocode";
import type { MapPlace } from "@shared/types/place";
import type { Walk } from "@shared/types/walk";
import type { MapInstance } from "../types/map.types";
import {
  MAP_INITIAL_USER_LOCATION_ZOOM,
  MAP_MARKER_FOCUS_ZOOM,
  MAP_USER_LOCATION_ZOOM,
} from "./map.constants";

type Coordinates = [number, number];

const GEOLOCATION_TIMEOUT_MS = 5000;

export const focusMapCoordinates = (
  mapInstance: MapInstance | null,
  coordinates: Coordinates,
  minZoom = MAP_MARKER_FOCUS_ZOOM,
) => {
  if (!mapInstance) return;

  mapInstance.setCenter(coordinates);

  const currentZoom = mapInstance.getZoom();
  if (currentZoom < minZoom) {
    mapInstance.setZoom(minZoom);
  }
};

export const focusWalkMarker = (mapInstance: MapInstance | null, walk: Walk) => {
  focusMapCoordinates(mapInstance, walk.coordinates);
};

export const focusPlaceMarker = (
  mapInstance: MapInstance | null,
  place: MapPlace,
) => {
  focusMapCoordinates(mapInstance, place.coordinates);
};

export const centerMapOnUserLocation = async (
  mapInstance: MapInstance | null,
  zoom = MAP_USER_LOCATION_ZOOM,
) => {
  if (!mapInstance) return false;

  try {
    const position = await Geolocation.getCurrentPosition({
      timeout: GEOLOCATION_TIMEOUT_MS,
    });

    mapInstance.setCenter([position.coords.longitude, position.coords.latitude]);
    mapInstance.setZoom(zoom);

    return true;
  } catch {
    return false;
  }
};

export const centerMapOnInitialUserLocation = async (
  mapInstance: MapInstance | null,
) => centerMapOnUserLocation(mapInstance, MAP_INITIAL_USER_LOCATION_ZOOM);

export const resolveWalkLocationLabel = async (
  coords: Coordinates,
  signal?: AbortSignal,
) => reverseGeocode(coords[0], coords[1], signal);
