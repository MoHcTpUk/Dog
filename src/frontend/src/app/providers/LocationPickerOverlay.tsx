import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useMapGL } from '@features/map/context';
import { Button, CenterMapPin } from '@shared/ui';
import { useCenterPinMotion } from '@shared/hooks';
import { Text } from '@shared/ui/Text';
import { reverseGeocode } from '@shared/utils/reverseGeocode';

const LOCATION_PIN_REST_TRANSFORM = 'translate(-50%, calc(-100% + 1px))';
const LOCATION_PIN_LIFTED_TRANSFORM = 'translate(-50%, calc(-100% - 9px))';
const LOCATION_SHADOW_REST_TRANSFORM = 'translate(-50%, -50%) scale(1)';
const LOCATION_SHADOW_ACTIVE_TRANSFORM = 'translate(-50%, -50%) scale(1.18)';

export const LocationPickerOverlay: React.FC = () => {
  const { t } = useTranslation();
  const {
    locationPickerActive,
    locationPickerInitialCoords,
    cancelLocationPicker,
    confirmLocationPicker,
    mapInstance,
  } = useMapGL();

  const [center, setCenter] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [pinViewportCenter, setPinViewportCenter] = useState({
    left: '50%',
    top: '50%',
  });

  // Direct DOM refs — avoid React re-renders on map move events
  const isMapMovingRef = useRef(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const geocodeAbortRef = useRef<AbortController | null>(null);
  const geocodeDebounceRef = useRef<number | null>(null);

  const syncPinViewportCenter = useCallback(() => {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    const rect = mapContainer.getBoundingClientRect();
    setPinViewportCenter({
      left: `${rect.left + rect.width / 2}px`,
      top: `${rect.top + rect.height / 2}px`,
    });
  }, []);

  const getCoordsUnderPin = useCallback((): [number, number] | null => {
    if (!mapInstance) return null;

    const mapContainer = document.getElementById('map-container');
    if (mapContainer && typeof mapInstance.unproject === 'function') {
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

  // Center map on initial coords when picker opens
  useEffect(() => {
    if (!locationPickerActive || !mapInstance) return;
    syncPinViewportCenter();

    if (locationPickerInitialCoords) {
      mapInstance.setCenter(locationPickerInitialCoords);
      mapInstance.setZoom(15);
      setCenter(locationPickerInitialCoords);
      fetchAddressForCoords(locationPickerInitialCoords);
    } else {
      const coords = getCoordsUnderPin();
      if (coords) {
        setCenter(coords);
        fetchAddressForCoords(coords);
      }
    }

    return () => {
      if (geocodeDebounceRef.current) {
        window.clearTimeout(geocodeDebounceRef.current);
        geocodeDebounceRef.current = null;
      }
      geocodeAbortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationPickerActive, mapInstance, syncPinViewportCenter, getCoordsUnderPin]);

  useEffect(() => {
    if (!locationPickerActive) return;

    syncPinViewportCenter();

    const handleResize = () => {
      syncPinViewportCenter();
    };

    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, [locationPickerActive, syncPinViewportCenter]);

  // Reset state when picker deactivates
  useEffect(() => {
    if (!locationPickerActive) {
      isMapMovingRef.current = false;
      setAddress('');
      setCenter(null);
      setIsLoadingAddress(false);
    }
  }, [locationPickerActive]);

  const fetchAddressForCoords = useCallback(async (coords: [number, number]) => {
    geocodeAbortRef.current?.abort();
    const controller = new AbortController();
    geocodeAbortRef.current = controller;
    setIsLoadingAddress(true);
    try {
      const addr = await reverseGeocode(coords[0], coords[1], controller.signal);
      if (!controller.signal.aborted) {
        setAddress(addr);
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
    } finally {
      if (!controller.signal.aborted) {
        setIsLoadingAddress(false);
      }
    }
  }, []);

  // Map move events — direct DOM manipulation, no setState
  const handlePinMoveStart = useCallback(() => {
      isMapMovingRef.current = true;
      if (geocodeDebounceRef.current) {
        window.clearTimeout(geocodeDebounceRef.current);
        geocodeDebounceRef.current = null;
      }
      // Direct DOM — no React re-render
      if (drawerRef.current) {
        drawerRef.current.style.transform = 'translateY(100%)';
      }
    }, []);

  const handlePinMoveEnd = useCallback(() => {
      isMapMovingRef.current = false;
      // Direct DOM — no React re-render
      if (drawerRef.current) {
        drawerRef.current.style.transform = 'translateY(0)';
      }
      try {
        const coords = getCoordsUnderPin();
        if (!coords) return;
        setCenter(coords);

        if (geocodeDebounceRef.current) window.clearTimeout(geocodeDebounceRef.current);
        geocodeDebounceRef.current = window.setTimeout(() => {
          fetchAddressForCoords(coords);
          geocodeDebounceRef.current = null;
        }, 500);
      } catch {
        // ignore
      }
    }, [fetchAddressForCoords, getCoordsUnderPin]);

  const { pinRef, shadowRef: pinShadowRef } = useCenterPinMotion({
    mapInstance,
    active: locationPickerActive,
    restTransform: LOCATION_PIN_REST_TRANSFORM,
    liftedTransform: LOCATION_PIN_LIFTED_TRANSFORM,
    restShadowTransform: LOCATION_SHADOW_REST_TRANSFORM,
    activeShadowTransform: LOCATION_SHADOW_ACTIVE_TRANSFORM,
    restShadowOpacity: 0.45,
    activeShadowOpacity: 0.72,
    onMoveStart: handlePinMoveStart,
    onMoveEnd: handlePinMoveEnd,
  });

  const handleSave = useCallback(() => {
    if (center) {
      confirmLocationPicker(center, address);
    }
  }, [center, address, confirmLocationPicker]);

  if (!locationPickerActive) return null;

  return (
    <>
      {/* Center pin */}
      <CenterMapPin
        top={pinViewportCenter.top}
        left={pinViewportCenter.left}
        pinRef={pinRef}
        shadowRef={pinShadowRef}
        initialPinTransform={LOCATION_PIN_REST_TRANSFORM}
        initialShadowTransform={LOCATION_SHADOW_REST_TRANSFORM}
        initialShadowOpacity={0.45}
        shadow={
          <div
            style={{
              width: 8,
              height: 4,
              background: '#71717A',
              borderRadius: 999,
              filter: 'blur(2px)',
            }}
          />
        }
        body={
          <div style={{ position: 'relative', width: 44, height: 68 }}>
            <div className="w-11 h-11 bg-[#3F335A] rounded-full flex items-center justify-center shadow-lg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
              </svg>
            </div>
            <div
              style={{
                position: 'absolute',
                left: 15,
                top: 43,
                width: 14,
                height: 10,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '7px solid transparent',
                  borderRight: '7px solid transparent',
                  borderTop: '10px solid #3F335A',
                }}
              />
            </div>
          </div>
        }
      />

      {/* Bottom sheet */}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 35,
          transform: 'translateY(0)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="bg-zinc-100 rounded-t-3xl px-5 pt-3 pb-10 flex flex-col gap-5 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
      >
        {/* Handle */}
        <div className="flex justify-center">
          <div className="w-14 h-1 bg-zinc-300 rounded-full" />
        </div>

        {/* Address */}
        <div className="flex items-start gap-3 min-h-[44px]">
          <div className="mt-1 flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#3F335A"/>
            </svg>
          </div>
          <div className="flex-1">
            {isLoadingAddress ? (
              <Text variant="regular-14" color="muted">{t('Determining address...')}</Text>
            ) : address ? (
              <Text variant="medium-16" color="primary">{address}</Text>
            ) : (
              <Text variant="regular-14" color="muted">{t('Move map to select location')}</Text>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Button variant="secondary-white" size="L" fullWidth onClick={cancelLocationPicker}>
              {t('Back')}
            </Button>
          </div>
          <div className="flex-1">
            <Button
              variant="primary"
              size="L"
              fullWidth
              onClick={handleSave}
              disabled={!address && !isLoadingAddress}
            >
              {t('Save')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
