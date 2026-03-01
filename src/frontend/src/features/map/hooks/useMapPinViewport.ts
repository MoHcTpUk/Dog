import { useCallback, useEffect, useState } from "react";
import type { MapInstance } from "../types/map.types";

const MAP_CONTAINER_ID = "map-container";
const DEFAULT_PIN_VIEWPORT_CENTER = {
  left: "50%",
  top: "50%",
};

const getMapContainer = () => document.getElementById(MAP_CONTAINER_ID);

export const useMapPinViewport = ({
  active,
  mapInstance,
}: {
  active: boolean;
  mapInstance: MapInstance | null;
}) => {
  const [pinViewportCenter, setPinViewportCenter] = useState(
    DEFAULT_PIN_VIEWPORT_CENTER,
  );

  const syncPinViewportCenter = useCallback(() => {
    const mapContainer = getMapContainer();
    if (!mapContainer) return;

    const rect = mapContainer.getBoundingClientRect();
    setPinViewportCenter({
      left: `${rect.left + rect.width / 2}px`,
      top: `${rect.top + rect.height / 2}px`,
    });
  }, []);

  const getCoordsUnderPin = useCallback((): [number, number] | null => {
    if (!mapInstance) return null;

    const mapContainer = getMapContainer();

    if (mapContainer && typeof mapInstance.unproject === "function") {
      const coords = mapInstance.unproject([
        mapContainer.clientWidth / 2,
        mapContainer.clientHeight / 2,
      ]);

      if (Array.isArray(coords) && coords.length >= 2) {
        return [coords[0], coords[1]];
      }
    }

    try {
      const center = mapInstance.getCenter();
      return [center.lng ?? center[0], center.lat ?? center[1]];
    } catch {
      return null;
    }
  }, [mapInstance]);

  useEffect(() => {
    if (!active) return;

    syncPinViewportCenter();

    const handleResize = () => {
      syncPinViewportCenter();
    };

    window.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, [active, syncPinViewportCenter]);

  return {
    pinViewportCenter,
    syncPinViewportCenter,
    getCoordsUnderPin,
  };
};
