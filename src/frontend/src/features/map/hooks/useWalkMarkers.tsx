import { useCallback, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import type { Walk, WalkCluster } from "@shared/types/walk";
import { clusterWalks, isCluster } from "@shared/utils/clustering.utils";
import { WalkPin, WalkPinCluster } from "@entities/walk";
import { useAnimatedMapMarkers } from "./useAnimatedMapMarkers";
import type { MapGLAPI, MapInstance, MapMarker } from "../types/map.types";

interface UseWalkMarkersProps {
  mapInstance: MapInstance | null;
  mapglAPI: MapGLAPI | null;
  walks: Walk[];
  clusterZoomLevel: number;
  onClusterClick: (center: [number, number]) => void;
  onWalkClick?: (walkId: string) => void;
  isPaused?: boolean;
}

interface WalkMarkerData {
  marker: MapMarker;
  root: Root;
  id: string;
}

const getMarkerElement = (marker: MapMarker): HTMLElement | null =>
  marker.getContent?.() || marker._el || null;

export const useWalkMarkers = ({
  mapInstance,
  mapglAPI,
  walks,
  clusterZoomLevel,
  onClusterClick,
  onWalkClick,
  isPaused = false,
}: UseWalkMarkersProps) => {
  const onClusterClickRef = useRef(onClusterClick);
  const onWalkClickRef = useRef(onWalkClick);

  onClusterClickRef.current = onClusterClick;
  onWalkClickRef.current = onWalkClick;

  const clusteredItems = useMemo(
    () => clusterWalks(walks, clusterZoomLevel),
    [clusterZoomLevel, walks],
  );
  const itemsSignature = useMemo(
    () => walks.map((walk) => walk.id).join(","),
    [walks],
  );

  const applyExitAnimation = useCallback((marker: MapMarker) => {
    const element = getMarkerElement(marker);
    if (!element) return;

    const walkPinContainer = element.querySelector(".walk-pin-container");
    const clusterContainer = element.querySelector(".cluster-container");

    if (walkPinContainer) {
      walkPinContainer.classList.remove("walk-pin-enter");
      walkPinContainer.classList.add("walk-pin-exit");
    } else if (clusterContainer) {
      clusterContainer.classList.remove("cluster-enter");
      clusterContainer.classList.add("cluster-exit");
    }
  }, []);

  const createMarkerEntry = useCallback(
    (
      item: Walk | WalkCluster,
      context: { mapInstance: MapInstance; mapglAPI: MapGLAPI },
    ): WalkMarkerData => {
      const markerElement = document.createElement("div");
      const root = createRoot(markerElement);

      if (isCluster(item)) {
        root.render(
          <WalkPinCluster
            dogAvatars={item.dogAvatars}
            walkCount={item.walkCount}
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
        <WalkPin
          dogAvatar={item.dogAvatar}
          time={item.time}
          dogCount={item.dogCount}
          status={item.status}
          onClick={() => onWalkClickRef.current?.(item.id)}
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
