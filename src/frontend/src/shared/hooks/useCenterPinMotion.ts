import { useCallback, useEffect, useRef } from "react";
import type { MapInstance } from "@features/map/types/map.types";

interface UseCenterPinMotionOptions {
  mapInstance: MapInstance | null;
  active: boolean;
  restTransform: string;
  liftedTransform: string;
  restShadowTransform: string;
  activeShadowTransform: string;
  restShadowOpacity: number;
  activeShadowOpacity: number;
  onMoveStart?: () => void;
  onMoveEnd?: () => void;
}

export const useCenterPinMotion = ({
  mapInstance,
  active,
  restTransform,
  liftedTransform,
  restShadowTransform,
  activeShadowTransform,
  restShadowOpacity,
  activeShadowOpacity,
  onMoveStart,
  onMoveEnd,
}: UseCenterPinMotionOptions) => {
  const pinRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const isZoomingRef = useRef(false);

  const liftPin = useCallback(() => {
    if (pinRef.current) {
      pinRef.current.style.transform = liftedTransform;
    }
    if (shadowRef.current) {
      shadowRef.current.style.opacity = String(activeShadowOpacity);
      shadowRef.current.style.transform = activeShadowTransform;
    }
  }, [activeShadowOpacity, activeShadowTransform, liftedTransform]);

  const lowerPin = useCallback(() => {
    if (pinRef.current) {
      pinRef.current.style.transform = restTransform;
    }
    if (shadowRef.current) {
      shadowRef.current.style.opacity = String(restShadowOpacity);
      shadowRef.current.style.transform = restShadowTransform;
    }
  }, [restShadowOpacity, restShadowTransform, restTransform]);

  useEffect(() => {
    if (!active) {
      isZoomingRef.current = false;
    }
    lowerPin();
  }, [active, lowerPin]);

  useEffect(() => {
    if (!mapInstance || !active) return;

    const handleZoomStart = () => {
      isZoomingRef.current = true;
    };

    const handleZoomEnd = () => {
      isZoomingRef.current = false;
    };

    const handleCenterStart = () => {
      if (!isZoomingRef.current) {
        liftPin();
      }
    };

    const handleMoveStart = () => {
      onMoveStart?.();
    };

    const handleMoveEnd = () => {
      lowerPin();
      onMoveEnd?.();
    };

    mapInstance.on("zoomstart", handleZoomStart);
    mapInstance.on("zoomend", handleZoomEnd);
    mapInstance.on("centerstart", handleCenterStart);
    mapInstance.on("movestart", handleMoveStart);
    mapInstance.on("moveend", handleMoveEnd);

    return () => {
      mapInstance.off("zoomstart", handleZoomStart);
      mapInstance.off("zoomend", handleZoomEnd);
      mapInstance.off("centerstart", handleCenterStart);
      mapInstance.off("movestart", handleMoveStart);
      mapInstance.off("moveend", handleMoveEnd);
    };
  }, [active, liftPin, lowerPin, mapInstance, onMoveEnd, onMoveStart]);

  return {
    pinRef,
    shadowRef,
    lowerPin,
  };
};
