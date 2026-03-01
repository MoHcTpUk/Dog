import { useCallback, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import type { MapPlace, PlaceCluster } from "@shared/types/place";
import { clusterPlaces, isPlaceCluster } from "@shared/utils/clustering.utils";
import { PlacePin, PlacePinCluster } from "@entities/place";
import { useAnimatedMapMarkers } from "./useAnimatedMapMarkers";
import type { MapGLAPI, MapInstance, MapMarker } from "../types/map.types";

interface UsePlaceMarkersProps {
  mapInstance: MapInstance | null;
  mapglAPI: MapGLAPI | null;
  places: MapPlace[];
  clusterZoomLevel: number;
  onClusterClick: (center: [number, number]) => void;
  onPlaceClick?: (placeId: string) => void;
  isPaused?: boolean;
}

interface PlaceMarkerData {
  marker: MapMarker;
  root: Root;
  id: string;
}

const getMarkerElement = (marker: MapMarker): HTMLElement | null =>
  marker.getContent?.() || marker._el || null;

export const usePlaceMarkers = ({
  mapInstance,
  mapglAPI,
  places,
  clusterZoomLevel,
  onClusterClick,
  onPlaceClick,
  isPaused = false,
}: UsePlaceMarkersProps) => {
  const onClusterClickRef = useRef(onClusterClick);
  const onPlaceClickRef = useRef(onPlaceClick);

  onClusterClickRef.current = onClusterClick;
  onPlaceClickRef.current = onPlaceClick;

  const clusteredItems = useMemo(
    () => clusterPlaces(places, clusterZoomLevel),
    [clusterZoomLevel, places],
  );
  const itemsSignature = useMemo(
    () => places.map((place) => place.id).join(","),
    [places],
  );

  const applyExitAnimation = useCallback((marker: MapMarker) => {
    const element = getMarkerElement(marker);
    const container = element?.querySelector(".place-pin-container");

    if (!container) return;

    container.classList.remove("place-pin-enter");
    container.classList.add("place-pin-exit");
  }, []);

  const createMarkerEntry = useCallback(
    (
      item: MapPlace | PlaceCluster,
      context: { mapInstance: MapInstance; mapglAPI: MapGLAPI },
    ): PlaceMarkerData => {
      const markerElement = document.createElement("div");
      const root = createRoot(markerElement);

      if (isPlaceCluster(item)) {
        root.render(
          <PlacePinCluster
            placeCount={item.placeCount}
            onClick={() => onClusterClickRef.current(item.center)}
            isAnimating={true}
          />,
        );

        const marker = new context.mapglAPI.HtmlMarker(context.mapInstance, {
          coordinates: item.center,
          html: markerElement,
          anchor: [0, 0],
        });

        return { marker, root, id: item.id };
      }

      root.render(
        <PlacePin
          category={item.category}
          onClick={
            onPlaceClickRef.current
              ? () => onPlaceClickRef.current?.(item.id)
              : undefined
          }
          isAnimating={true}
        />,
      );

      const marker = new context.mapglAPI.HtmlMarker(context.mapInstance, {
        coordinates: item.coordinates,
        html: markerElement,
        anchor: [0, 0],
      });

      return { marker, root, id: item.id };
    },
    [],
  );

  useAnimatedMapMarkers({
    mapInstance,
    mapglAPI,
    items: clusteredItems,
    itemsSignature,
    clusterZoomLevel,
    isPaused,
    applyExitAnimation,
    createMarkerEntry,
  });
};
