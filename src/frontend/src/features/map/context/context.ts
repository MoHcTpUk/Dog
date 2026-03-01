import { createContext } from "react";
import {
  createMapGLContextDefaultValue,
  type MapGLContextValue,
  type MapTab,
  type MapLocationPickerConfirmHandler,
} from "./context.types";
import type { MapPlace, PlaceCategory } from "@shared/types/place";

export type { PlaceCategory, MapPlace as Place };
export type { MapGLContextValue, MapLocationPickerConfirmHandler, MapTab };

export const MapGLContext = createContext<MapGLContextValue>(
  createMapGLContextDefaultValue(),
);
