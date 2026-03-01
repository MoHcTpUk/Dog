import { useEffect, useRef } from "react";
import type { Root } from "react-dom/client";
import type { MapGLAPI, MapInstance, MapMarker } from "../types/map.types";

interface MarkerEntry {
  marker: MapMarker;
  root: Root;
  id: string;
}

interface UseAnimatedMapMarkersOptions<TItem extends { id: string }> {
  mapInstance: MapInstance | null;
  mapglAPI: MapGLAPI | null;
  items: TItem[];
  itemsSignature: string;
  clusterZoomLevel: number;
  isPaused?: boolean;
  createDelayMs?: number;
  removeDelayMs?: number;
  applyExitAnimation: (marker: MapMarker) => void;
  createMarkerEntry: (
    item: TItem,
    context: { mapInstance: MapInstance; mapglAPI: MapGLAPI },
  ) => MarkerEntry;
}

export const useAnimatedMapMarkers = <TItem extends { id: string }>({
  mapInstance,
  mapglAPI,
  items,
  itemsSignature,
  clusterZoomLevel,
  isPaused = false,
  createDelayMs = 180,
  removeDelayMs = 350,
  applyExitAnimation,
  createMarkerEntry,
}: UseAnimatedMapMarkersOptions<TItem>) => {
  const markersRef = useRef<MarkerEntry[]>([]);
  const cleanupTimeoutRef = useRef<number | undefined>(undefined);
  const createTimeoutRef = useRef<number | undefined>(undefined);
  const prevClusterZoomLevelRef = useRef(clusterZoomLevel);
  const prevItemsSignatureRef = useRef("");

  useEffect(() => {
    if (isPaused) return;
    if (!mapInstance || !mapglAPI) return;

    const hasClusteringChanged =
      prevClusterZoomLevelRef.current !== clusterZoomLevel;
    prevClusterZoomLevelRef.current = clusterZoomLevel;

    const hasItemsChanged = prevItemsSignatureRef.current !== itemsSignature;
    prevItemsSignatureRef.current = itemsSignature;

    if (
      !hasClusteringChanged &&
      !hasItemsChanged &&
      markersRef.current.length > 0
    ) {
      return;
    }

    if (cleanupTimeoutRef.current) {
      window.clearTimeout(cleanupTimeoutRef.current);
    }

    if (createTimeoutRef.current) {
      window.clearTimeout(createTimeoutRef.current);
    }

    const newItemsMap = new Map(items.map((item) => [item.id, item]));
    const oldItemsMap = new Map(markersRef.current.map((entry) => [entry.id, entry]));

    const markersToRemove: MarkerEntry[] = [];
    const markersToKeep: MarkerEntry[] = [];

    markersRef.current.forEach((entry) => {
      if (newItemsMap.has(entry.id)) {
        markersToKeep.push(entry);
      } else {
        markersToRemove.push(entry);
      }
    });

    markersToRemove.forEach(({ marker }) => {
      applyExitAnimation(marker);
    });

    cleanupTimeoutRef.current = window.setTimeout(() => {
      markersToRemove.forEach(({ marker, root }) => {
        root.unmount();
        marker.destroy();
      });
    }, removeDelayMs);

    markersRef.current = markersToKeep;

    const itemsToCreate = items.filter((item) => !oldItemsMap.has(item.id));

    if (itemsToCreate.length > 0) {
      createTimeoutRef.current = window.setTimeout(() => {
        itemsToCreate.forEach((item) => {
          markersRef.current.push(
            createMarkerEntry(item, {
              mapInstance,
              mapglAPI,
            }),
          );
        });
      }, createDelayMs);
    }

    return () => {
      if (cleanupTimeoutRef.current) {
        window.clearTimeout(cleanupTimeoutRef.current);
      }

      if (createTimeoutRef.current) {
        window.clearTimeout(createTimeoutRef.current);
      }
    };
  }, [
    applyExitAnimation,
    clusterZoomLevel,
    createDelayMs,
    createMarkerEntry,
    isPaused,
    items,
    itemsSignature,
    mapglAPI,
    mapInstance,
    removeDelayMs,
  ]);

  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        window.clearTimeout(cleanupTimeoutRef.current);
      }

      if (createTimeoutRef.current) {
        window.clearTimeout(createTimeoutRef.current);
      }

      markersRef.current.forEach(({ marker, root }) => {
        root.unmount();
        marker.destroy();
      });

      markersRef.current = [];
    };
  }, []);
};
