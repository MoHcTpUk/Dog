import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMapGL } from "@features/map/context";
import { Button, CenterMapPin, Toast } from "@shared/ui";
import { useCenterPinMotion } from "@shared/hooks";
import { Text } from "@shared/ui/Text";
import { fetchNearbyPlaces, type NearbyPlace } from "@shared/api/overpass";
import type { Location } from "history";

interface LocationState {
  background?: Location;
}
const PLACE_PIN_REST_TRANSFORM = "translate(-50%, calc(-100% + 1px))";
const PLACE_PIN_LIFTED_TRANSFORM = "translate(-50%, calc(-100% - 9px))";
const PLACE_SHADOW_REST_TRANSFORM = "translate(-50%, -50%) scale(1)";
const PLACE_SHADOW_ACTIVE_TRANSFORM = "translate(-50%, -50%) scale(1.18)";

export const PlaceCreationOverlay: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const {
    placeCreationActive,
    cancelPlaceCreation,
    mapInstance,
  } = useMapGL();

  const background = location.state?.background;
  const currentPath = background ? background.pathname : location.pathname;
  const isMapRoute = currentPath.startsWith("/map");

  const [nearbyCount, setNearbyCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [showNoPlacesNotif, setShowNoPlacesNotif] = useState(false);
  const [pinViewportCenter, setPinViewportCenter] = useState({
    left: "50%",
    top: "50%",
  });

  const [allNearbyPlaces, setAllNearbyPlaces] = useState<NearbyPlace[]>([]);

  const notifTimerRef = useRef<number | null>(null);
  const countAbortRef = useRef<AbortController | null>(null);
  const countDebounceRef = useRef<number | null>(null);
  const previousPathRef = useRef(location.pathname);
  const drawerEnterFrameRef = useRef<number | null>(null);

  // Direct DOM refs — avoid React re-renders on map move events
  const isMapMovingRef = useRef(false);
  const locationDrawerRef = useRef<HTMLDivElement>(null);
  const [isDrawerEntering, setIsDrawerEntering] = useState(false);

  const syncPinViewportCenter = useCallback(() => {
    const mapContainer = document.getElementById("map-container");
    if (!mapContainer) return;

    const rect = mapContainer.getBoundingClientRect();
    setPinViewportCenter({
      left: `${rect.left + rect.width / 2}px`,
      top: `${rect.top + rect.height / 2}px`,
    });
  }, []);

  const getCoordsUnderPin = useCallback((): [number, number] | null => {
    if (!mapInstance) return null;

    const mapContainer = document.getElementById("map-container");
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
      const c = mapInstance.getCenter();
      return [c.lng ?? c[0], c.lat ?? c[1]];
    } catch {
      return null;
    }
  }, [mapInstance]);

  // Reset flow
  useEffect(() => {
    if (placeCreationActive) {
      isMapMovingRef.current = false;
      setNearbyCount(0);
      setAllNearbyPlaces([]);
    }
  }, [placeCreationActive]);

  const fetchCountForCoords = useCallback(async (coords: [number, number]) => {
    countAbortRef.current?.abort();
    const controller = new AbortController();
    countAbortRef.current = controller;
    setIsLoadingCount(true);
    try {
      const places = await fetchNearbyPlaces(
        coords[0],
        coords[1],
        100,
        40,
        controller.signal,
      );
      if (!controller.signal.aborted) {
        setNearbyCount(places.length);
        setAllNearbyPlaces(places);
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      if (!controller.signal.aborted) {
        setNearbyCount(0);
        setAllNearbyPlaces([]);
      }
    } finally {
      if (!controller.signal.aborted) setIsLoadingCount(false);
    }
  }, []);

  // Get initial center and count
  useEffect(() => {
    if (!placeCreationActive || !mapInstance) return;
    syncPinViewportCenter();
    const coords = getCoordsUnderPin();
    if (coords) {
      fetchCountForCoords(coords);
    }
    return () => {
      if (countDebounceRef.current) {
        window.clearTimeout(countDebounceRef.current);
        countDebounceRef.current = null;
      }
      countAbortRef.current?.abort();
    };
  }, [placeCreationActive, mapInstance, fetchCountForCoords, syncPinViewportCenter, getCoordsUnderPin]);

  useEffect(() => {
    if (!placeCreationActive) return;
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
  }, [placeCreationActive, syncPinViewportCenter]);

  useEffect(() => {
    const cameBackFromPlaceSelect =
      previousPathRef.current === "/place/create/select" &&
      location.pathname === "/map" &&
      placeCreationActive;

    if (cameBackFromPlaceSelect) {
      setIsDrawerEntering(true);
      if (drawerEnterFrameRef.current) {
        window.cancelAnimationFrame(drawerEnterFrameRef.current);
      }
      drawerEnterFrameRef.current = window.requestAnimationFrame(() => {
        drawerEnterFrameRef.current = window.requestAnimationFrame(() => {
          setIsDrawerEntering(false);
          drawerEnterFrameRef.current = null;
        });
      });
    }

    previousPathRef.current = location.pathname;
  }, [location.pathname, placeCreationActive]);

  useEffect(() => {
    return () => {
      if (drawerEnterFrameRef.current) {
        window.cancelAnimationFrame(drawerEnterFrameRef.current);
      }
    };
  }, []);

  // Map move events for step 1
  const handlePinMoveStart = useCallback(() => {
      isMapMovingRef.current = true;
      if (countDebounceRef.current) {
        window.clearTimeout(countDebounceRef.current);
        countDebounceRef.current = null;
      }
      countAbortRef.current?.abort();
      if (locationDrawerRef.current) {
        locationDrawerRef.current.style.transform = "translateY(100%)";
        locationDrawerRef.current.style.opacity = "0";
        locationDrawerRef.current.style.pointerEvents = "none";
      }
    }, []);

  const handlePinMoveEnd = useCallback(() => {
      isMapMovingRef.current = false;
      if (locationDrawerRef.current) {
        locationDrawerRef.current.style.transform = "translateY(0)";
        locationDrawerRef.current.style.opacity = "1";
        locationDrawerRef.current.style.pointerEvents = "auto";
      }
      try {
        const coords = getCoordsUnderPin();
        if (!coords) return;
        if (countDebounceRef.current)
          window.clearTimeout(countDebounceRef.current);
        countDebounceRef.current = window.setTimeout(() => {
          fetchCountForCoords(coords);
          countDebounceRef.current = null;
        }, 500);
      } catch {
        // ignore
      }
    }, [fetchCountForCoords, getCoordsUnderPin]);

  const { pinRef, shadowRef: pinShadowRef } = useCenterPinMotion({
    mapInstance,
    active: placeCreationActive,
    restTransform: PLACE_PIN_REST_TRANSFORM,
    liftedTransform: PLACE_PIN_LIFTED_TRANSFORM,
    restShadowTransform: PLACE_SHADOW_REST_TRANSFORM,
    activeShadowTransform: PLACE_SHADOW_ACTIVE_TRANSFORM,
    restShadowOpacity: 0.3,
    activeShadowOpacity: 0.7,
    onMoveStart: handlePinMoveStart,
    onMoveEnd: handlePinMoveEnd,
  });

  const handleCancel = useCallback(() => {
    cancelPlaceCreation();
  }, [cancelPlaceCreation]);

  const handleNextFromLocation = useCallback(() => {
    if (nearbyCount === 0 && !isLoadingCount) {
      setShowNoPlacesNotif(true);
      if (notifTimerRef.current) window.clearTimeout(notifTimerRef.current);
      notifTimerRef.current = window.setTimeout(() => {
        setShowNoPlacesNotif(false);
        notifTimerRef.current = null;
      }, 3000);
      return;
    }
    history.push("/place/create/select", {
      nearbyPlaces: allNearbyPlaces,
    });
  }, [nearbyCount, isLoadingCount, history, allNearbyPlaces]);

  if (!isMapRoute && !showNoPlacesNotif) return null;

  const countText = isLoadingCount
    ? t("Loading places...")
    : nearbyCount > 0
    ? `${nearbyCount} ${t("venues nearby")}`
    : t("No venues nearby");

  return (
    <>
      {/* Notifications */}
      {showNoPlacesNotif && (
        <Toast
          message={t("No places nearby, move the map")}
          variant="info"
        />
      )}
      {placeCreationActive && (
        <>
          <CenterMapPin
            top={pinViewportCenter.top}
            left={pinViewportCenter.left}
            pinRef={pinRef}
            shadowRef={pinShadowRef}
            initialPinTransform={PLACE_PIN_REST_TRANSFORM}
            initialShadowTransform={PLACE_SHADOW_REST_TRANSFORM}
            initialShadowOpacity={0.3}
            shadow={
              <svg
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity="0.7" filter="url(#pinShadowFilter)">
                  <ellipse cx="8" cy="6" rx="4" ry="2" fill="#645A7A" />
                </g>
                <defs>
                  <filter
                    id="pinShadowFilter"
                    x="0"
                    y="0"
                    width="16"
                    height="12"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    />
                    <feGaussianBlur
                      stdDeviation="2"
                      result="effect1_foregroundBlur"
                    />
                  </filter>
                </defs>
              </svg>
            }
            body={
              <div
                style={{
                  position: "relative",
                  width: 44,
                  height: 68,
                }}
              >
                <div className="p-0.5 bg-white rounded-2xl shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)] inline-flex justify-start items-center">
                  <div className="p-2 bg-zinc-100 rounded-xl flex justify-start items-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M2.25 10.5C2.25 5.115 6.615 0.75 12 0.75C17.385 0.75 21.75 5.115 21.75 10.5C21.75 13.9935 19.947 16.9325 17.987 19.1015C16.021 21.277 13.824 22.7595 12.8685 23.3545C12.6084 23.5183 12.3073 23.6052 12 23.6052C11.6927 23.6052 11.3916 23.5183 11.1315 23.3545C10.1765 22.7595 7.979 21.277 6.013 19.1015C4.053 16.9325 2.25 13.9935 2.25 10.5ZM10.89 5.5965C11.3565 4.697 12.643 4.697 13.11 5.5965L14.132 7.567L16.3205 7.998C17.2725 8.1855 17.657 9.339 17.0085 10.0605L15.442 11.8025L15.728 14.12C15.85 15.11 14.8215 15.837 13.929 15.3915L12 14.4285L10.0705 15.3915C9.1785 15.8365 8.1495 15.1095 8.272 14.12L8.558 11.8025L6.9915 10.0605C6.343 9.339 6.7275 8.1855 7.6795 7.998L9.868 7.567L10.89 5.5965Z"
                        fill="#3F335A"
                      />
                    </svg>
                  </div>
                </div>
                <div style={{ position: "absolute", left: 11, top: 40 }}>
                  <svg
                    width="22"
                    height="41"
                    viewBox="0 0 22 41"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g filter="url(#pinNeedleFilter)">
                      <path
                        d="M9 4H13V25C13 26.1046 12.1046 27 11 27C9.89543 27 9 26.1046 9 25V4Z"
                        fill="#3F335A"
                      />
                    </g>
                    <defs>
                      <filter
                        id="pinNeedleFilter"
                        x="0"
                        y="0"
                        width="22"
                        height="41"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                      >
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feColorMatrix
                          in="SourceAlpha"
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                          result="hardAlpha"
                        />
                        <feOffset dy="5" />
                        <feGaussianBlur stdDeviation="4.5" />
                        <feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix
                          type="matrix"
                          values="0 0 0 0 0.258824 0 0 0 0 0.227451 0 0 0 0 0.227451 0 0 0 0.06 0"
                        />
                        <feBlend
                          mode="normal"
                          in2="BackgroundImageFix"
                          result="effect1_dropShadow"
                        />
                        <feBlend
                          mode="normal"
                          in="SourceGraphic"
                          in2="effect1_dropShadow"
                          result="shape"
                        />
                      </filter>
                    </defs>
                  </svg>
                </div>
              </div>
            }
          />

          <div
            ref={locationDrawerRef}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 35,
              transform: isDrawerEntering ? "translateY(100%)" : "translateY(0)",
              opacity: isDrawerEntering ? 0 : 1,
              pointerEvents: isDrawerEntering ? "none" : "auto",
              transition:
                "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease",
            }}
            className="bg-zinc-100 rounded-t-3xl px-5 pt-3 pb-10 flex flex-col gap-5 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
          >
            <div className="flex justify-center">
              <div className="w-14 h-1 bg-zinc-300 rounded-full" />
            </div>

            <div className="flex flex-col gap-1">
              <Text variant="medium-16" color="primary">
                {t("Place the pin near the venue")}
              </Text>
              <Text variant="regular-14" color="muted">
                {countText}
              </Text>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <Button
                  variant="secondary-white"
                  size="L"
                  fullWidth
                  onClick={handleCancel}
                >
                  {t("Back")}
                </Button>
              </div>
              <div className="flex-1">
                <Button
                  variant="primary"
                  size="L"
                  fullWidth
                  disabled={isLoadingCount}
                  onClick={handleNextFromLocation}
                >
                  {t("Next")}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
