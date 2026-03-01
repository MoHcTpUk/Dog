import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMapGL } from "@features/map/context";
import {
  isMapOverlayRoute,
  type MapOverlayLocationState,
  MAP_BOTTOM_SHEET_TRANSITION,
  MAP_CENTER_PIN_LIFTED_TRANSFORM,
  MAP_CENTER_PIN_REST_TRANSFORM,
  MAP_CENTER_PIN_SHADOW_ACTIVE_TRANSFORM,
  MAP_CENTER_PIN_SHADOW_REST_TRANSFORM,
  setOverlayDrawerVisibility,
} from "@features/map/lib";
import {
  useAbortableMapRequest,
  useCenterPinMotion,
  useMapPinViewport,
} from "@features/map/hooks";
import { BottomSheetHandle, Button, CenterMapPin, Toast } from "@shared/ui";
import { Text } from "@shared/ui/Text";
import { useTransientFlag } from "@shared/hooks";
import { fetchNearbyPlaces, type NearbyPlace } from "@shared/api/overpass";

export const PlaceCreationOverlay: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation<MapOverlayLocationState>();
  const {
    placeCreationActive,
    cancelPlaceCreation,
    mapInstance,
  } = useMapGL();

  const isMapRoute = isMapOverlayRoute(location.pathname, location.state);

  const [nearbyCount, setNearbyCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [allNearbyPlaces, setAllNearbyPlaces] = useState<NearbyPlace[]>([]);
  const { isVisible: showNoPlacesNotif, show: showNoPlacesNotification } =
    useTransientFlag();
  const previousPathRef = useRef(location.pathname);
  const drawerEnterFrameRef = useRef<number | null>(null);

  // Direct DOM refs — avoid React re-renders on map move events
  const locationDrawerRef = useRef<HTMLDivElement>(null);
  const [isDrawerEntering, setIsDrawerEntering] = useState(false);
  const { pinViewportCenter, getCoordsUnderPin } = useMapPinViewport({
    active: placeCreationActive,
    mapInstance,
  });

  const {
    runRequest: runNearbyPlacesRequest,
    scheduleRequest: scheduleNearbyPlacesRequest,
    cancelRequest: cancelNearbyPlacesRequest,
  } = useAbortableMapRequest<NearbyPlace[]>({
    request: (coords, signal) =>
      fetchNearbyPlaces(coords[0], coords[1], 100, 40, signal),
    onStart: () => {
      setIsLoadingCount(true);
    },
    onSuccess: (places) => {
      setNearbyCount(places.length);
      setAllNearbyPlaces(places);
    },
    onError: () => {
      setNearbyCount(0);
      setAllNearbyPlaces([]);
    },
    onFinally: () => {
      setIsLoadingCount(false);
    },
  });

  // Reset flow
  useEffect(() => {
    if (placeCreationActive) {
      setNearbyCount(0);
      setAllNearbyPlaces([]);
      setIsLoadingCount(false);
    } else {
      cancelNearbyPlacesRequest();
      setIsLoadingCount(false);
    }
  }, [cancelNearbyPlacesRequest, placeCreationActive]);

  // Get initial center and count
  useEffect(() => {
    if (!placeCreationActive || !mapInstance) return;

    const coords = getCoordsUnderPin();
    if (coords) {
      void runNearbyPlacesRequest(coords);
    }
  }, [
    getCoordsUnderPin,
    mapInstance,
    placeCreationActive,
    runNearbyPlacesRequest,
  ]);

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
      cancelNearbyPlacesRequest();
      setOverlayDrawerVisibility(locationDrawerRef.current, false, {
        includeOpacity: true,
        includePointerEvents: true,
      });
    }, [cancelNearbyPlacesRequest]);

  const handlePinMoveEnd = useCallback(() => {
      setOverlayDrawerVisibility(locationDrawerRef.current, true, {
        includeOpacity: true,
        includePointerEvents: true,
      });

      const coords = getCoordsUnderPin();
      if (!coords) return;

      scheduleNearbyPlacesRequest(coords);
    }, [getCoordsUnderPin, scheduleNearbyPlacesRequest]);

  const { pinRef, shadowRef: pinShadowRef } = useCenterPinMotion({
    mapInstance,
    active: placeCreationActive,
    restTransform: MAP_CENTER_PIN_REST_TRANSFORM,
    liftedTransform: MAP_CENTER_PIN_LIFTED_TRANSFORM,
    restShadowTransform: MAP_CENTER_PIN_SHADOW_REST_TRANSFORM,
    activeShadowTransform: MAP_CENTER_PIN_SHADOW_ACTIVE_TRANSFORM,
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
      showNoPlacesNotification();
      return;
    }
    history.push("/place/create/select", {
      nearbyPlaces: allNearbyPlaces,
    });
  }, [nearbyCount, isLoadingCount, history, allNearbyPlaces, showNoPlacesNotification]);

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
            initialPinTransform={MAP_CENTER_PIN_REST_TRANSFORM}
            initialShadowTransform={MAP_CENTER_PIN_SHADOW_REST_TRANSFORM}
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
              transition: MAP_BOTTOM_SHEET_TRANSITION,
            }}
            className="bg-zinc-100 rounded-t-3xl px-5 pt-3 pb-10 flex flex-col gap-5 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
          >
            <BottomSheetHandle />

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
