import React, { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useMapGL } from '@features/map/context';
import {
  useMapAddressLookup,
  useCenterPinMotion,
  useMapPinViewport,
} from '@features/map/hooks';
import {
  MAP_BOTTOM_SHEET_TRANSITION,
  MAP_CENTER_PIN_LIFTED_TRANSFORM,
  MAP_CENTER_PIN_REST_TRANSFORM,
  MAP_CENTER_PIN_SHADOW_ACTIVE_TRANSFORM,
  MAP_CENTER_PIN_SHADOW_REST_TRANSFORM,
  setOverlayDrawerVisibility,
} from '@features/map/lib';
import { BottomSheetHandle, Button, CenterMapPin } from '@shared/ui';
import { Text } from '@shared/ui/Text';

export const LocationPickerOverlay: React.FC = () => {
  const { t } = useTranslation();
  const {
    locationPickerActive,
    locationPickerInitialCoords,
    cancelLocationPicker,
    confirmLocationPicker,
    mapInstance,
  } = useMapGL();

  // Direct DOM refs — avoid React re-renders on map move events
  const drawerRef = useRef<HTMLDivElement>(null);

  const { pinViewportCenter, getCoordsUnderPin } = useMapPinViewport({
    active: locationPickerActive,
    mapInstance,
  });

  const {
    center,
    setCenter,
    address,
    isLoadingAddress,
    runAddressLookup,
    scheduleAddressLookup,
    cancelAddressLookup,
  } = useMapAddressLookup({
    active: locationPickerActive,
  });

  // Center map on initial coords when picker opens
  useEffect(() => {
    if (!locationPickerActive || !mapInstance) return;

    if (locationPickerInitialCoords) {
      mapInstance.setCenter(locationPickerInitialCoords);
      mapInstance.setZoom(15);
      setCenter(locationPickerInitialCoords);
      void runAddressLookup(locationPickerInitialCoords);
    } else {
      const coords = getCoordsUnderPin();
      if (coords) {
        setCenter(coords);
        void runAddressLookup(coords);
      }
    }
  }, [
    getCoordsUnderPin,
    locationPickerActive,
    locationPickerInitialCoords,
    mapInstance,
    runAddressLookup,
    setCenter,
  ]);

  // Map move events — direct DOM manipulation, no setState
  const handlePinMoveStart = useCallback(() => {
    cancelAddressLookup();
    setOverlayDrawerVisibility(drawerRef.current, false);
  }, [cancelAddressLookup]);

  const handlePinMoveEnd = useCallback(() => {
    setOverlayDrawerVisibility(drawerRef.current, true);

    const coords = getCoordsUnderPin();
    if (!coords) return;

    setCenter(coords);
    scheduleAddressLookup(coords);
  }, [getCoordsUnderPin, scheduleAddressLookup, setCenter]);

  const { pinRef, shadowRef: pinShadowRef } = useCenterPinMotion({
    mapInstance,
    active: locationPickerActive,
    restTransform: MAP_CENTER_PIN_REST_TRANSFORM,
    liftedTransform: MAP_CENTER_PIN_LIFTED_TRANSFORM,
    restShadowTransform: MAP_CENTER_PIN_SHADOW_REST_TRANSFORM,
    activeShadowTransform: MAP_CENTER_PIN_SHADOW_ACTIVE_TRANSFORM,
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
        initialPinTransform={MAP_CENTER_PIN_REST_TRANSFORM}
        initialShadowTransform={MAP_CENTER_PIN_SHADOW_REST_TRANSFORM}
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
            <div className="p-0.5 bg-white rounded-2xl shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)] inline-flex justify-start items-center">
              <div className="p-2 bg-zinc-100 rounded-xl flex justify-start items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M13.8348 7.50039C14.1755 6.70955 14.3721 5.89934 14.3721 5.2454C14.3721 2.89731 12.4685 0.993652 10.1204 0.993652C7.77231 0.993652 5.86865 2.89731 5.86865 5.2454C5.86865 8.41753 10.1204 13.0004 10.1204 13.0004C10.1204 13.0004 11.3949 11.6268 12.5537 9.8329M14.4741 6.49863C15.8548 5.60719 17.5062 5.13979 19.201 5.24564C19.574 5.26897 19.7605 5.28063 19.8759 5.41211C19.9912 5.54358 19.9647 5.73359 19.9117 6.11362C19.4498 9.42613 17.8847 12.175 15.0818 14.332C14.5973 14.7048 14.3551 14.8912 14.0723 14.8779C13.7894 14.8646 13.584 14.6567 13.1732 14.2407L12.5568 13.6163C12.1644 13.2187 11.9681 13.02 11.9454 12.7493C11.9228 12.4786 12.0909 12.2433 12.4272 11.7728C12.9267 11.0737 13.3924 10.2552 13.7724 9.28199M18.6401 7.97755C18.6401 7.97755 17.4906 7.8438 15.5905 9.58087"
                    stroke="#3F3F46"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                left: 20,
                top: 44,
                width: 4,
                height: 24,
                background: '#3F3F46',
                borderBottomLeftRadius: 100,
                borderBottomRightRadius: 100,
                boxShadow: '0px 5px 9px 0px rgba(66,58,58,0.06)',
              }}
            />
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
          transition: MAP_BOTTOM_SHEET_TRANSITION,
        }}
        className="bg-zinc-100 rounded-t-3xl px-5 pt-3 pb-10 flex flex-col gap-5 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
      >
        {/* Handle */}
        <BottomSheetHandle />

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
