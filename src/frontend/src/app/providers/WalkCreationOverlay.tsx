import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMapGL } from '@features/map/context';
import { Button, Tag, Icon, CenterMapPin, Toast } from '@shared/ui';
import { useCenterPinMotion } from '@shared/hooks';
import { Text } from '@shared/ui/Text';
import { TimePicker, getDefaultTimeValue } from '@shared/ui/TimePicker';
import type { TimePickerValue } from '@shared/ui/TimePicker';
import { Textarea } from '@shared/ui/Textarea';
import { reverseGeocode } from '@shared/utils/reverseGeocode';
import type { Walk } from '@shared/types/walk';
import type { Location } from 'history';

interface LocationState {
  background?: Location;
}

type WalkStep = 'location' | 'time' | 'comment';

const STEP_TRANSITION = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';
const WALK_PIN_REST_TRANSFORM = 'translate(-50%, calc(-100% + 1px))';
const WALK_PIN_LIFTED_TRANSFORM = 'translate(-50%, calc(-100% - 9px))';
const WALK_SHADOW_REST_TRANSFORM = 'translate(-50%, -50%) scale(1)';
const WALK_SHADOW_ACTIVE_TRANSFORM = 'translate(-50%, -50%) scale(1.18)';
const DEFAULT_WALK_DOG_AVATAR =
  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=40&h=40&fit=crop';

export const WalkCreationOverlay: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation<LocationState>();
  const { walkCreationActive, cancelWalkCreation, mapInstance, addUserWalk } = useMapGL();

  const background = location.state?.background;
  const currentPath = background ? background.pathname : location.pathname;
  const isMapRoute = currentPath.startsWith('/map');

  const [step, setStep] = useState<WalkStep>('location');
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [timeValue, setTimeValue] = useState<TimePickerValue>(getDefaultTimeValue);
  const [comment, setComment] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [pinViewportCenter, setPinViewportCenter] = useState({
    left: '50%',
    top: '50%',
  });

  // Direct DOM refs — avoid React re-renders on map move events
  const isMapMovingRef = useRef(false);
  const locationDrawerRef = useRef<HTMLDivElement>(null);

  const geocodeAbortRef = useRef<AbortController | null>(null);
  const geocodeDebounceRef = useRef<number | null>(null);
  const successTimerRef = useRef<number | null>(null);

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

  useEffect(() => {
    if (walkCreationActive) {
      setStep('location');
      setComment('');
      setTimeValue(getDefaultTimeValue());
      setAddress('');
      isMapMovingRef.current = false;
    } else {
      if (geocodeDebounceRef.current) {
        window.clearTimeout(geocodeDebounceRef.current);
        geocodeDebounceRef.current = null;
      }
      geocodeAbortRef.current?.abort();
    }
  }, [walkCreationActive]);

  useEffect(() => {
    if (!walkCreationActive || !mapInstance) return;
    syncPinViewportCenter();
    const coords = getCoordsUnderPin();
    if (coords) {
      setCenter(coords);
      fetchAddressForCoords(coords);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walkCreationActive, mapInstance, syncPinViewportCenter, getCoordsUnderPin]);

  useEffect(() => {
    if (!walkCreationActive || step !== 'location') return;

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
  }, [walkCreationActive, step, syncPinViewportCenter]);

  useEffect(() => {
    if (step === 'location') return;
    if (geocodeDebounceRef.current) {
      window.clearTimeout(geocodeDebounceRef.current);
      geocodeDebounceRef.current = null;
    }
    geocodeAbortRef.current?.abort();
  }, [step]);

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

  const handlePinMoveStart = useCallback(() => {
      isMapMovingRef.current = true;
      if (geocodeDebounceRef.current) {
        window.clearTimeout(geocodeDebounceRef.current);
        geocodeDebounceRef.current = null;
      }
      // Direct DOM — no React re-render
      if (locationDrawerRef.current) {
        locationDrawerRef.current.style.transform = 'translateY(100%)';
        locationDrawerRef.current.style.opacity = '0';
        locationDrawerRef.current.style.pointerEvents = 'none';
      }
    }, []);

  const handlePinMoveEnd = useCallback(() => {
      isMapMovingRef.current = false;
      if (locationDrawerRef.current) {
        locationDrawerRef.current.style.transform = 'translateY(0)';
        locationDrawerRef.current.style.opacity = '1';
        locationDrawerRef.current.style.pointerEvents = 'auto';
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
    active: walkCreationActive && step === 'location',
    restTransform: WALK_PIN_REST_TRANSFORM,
    liftedTransform: WALK_PIN_LIFTED_TRANSFORM,
    restShadowTransform: WALK_SHADOW_REST_TRANSFORM,
    activeShadowTransform: WALK_SHADOW_ACTIVE_TRANSFORM,
    restShadowOpacity: 0.45,
    activeShadowOpacity: 0.72,
    onMoveStart: handlePinMoveStart,
    onMoveEnd: handlePinMoveEnd,
  });

  const handleCancel = useCallback(() => {
    cancelWalkCreation();
  }, [cancelWalkCreation]);

  const handleNext = useCallback(() => {
    if (step === 'location') setStep('time');
    else if (step === 'time') setStep('comment');
  }, [step]);

  const handleBack = useCallback(() => {
    if (step === 'location') cancelWalkCreation();
    else if (step === 'time') setStep('location');
    else if (step === 'comment') setStep('time');
  }, [step, cancelWalkCreation]);

  const buildWalkDate = useCallback(() => {
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + timeValue.dayOffset);
    scheduledAt.setHours(timeValue.hour, timeValue.minute, 0, 0);
    return scheduledAt;
  }, [timeValue.dayOffset, timeValue.hour, timeValue.minute]);

  const handlePublish = useCallback(() => {
    if (!center) return;

    const newWalk: Walk = {
      id: `session-walk-${Date.now()}`,
      dogAvatar: DEFAULT_WALK_DOG_AVATAR,
      time: buildWalkDate(),
      dogCount: 1,
      status: 'own',
      coordinates: center,
      description: comment || undefined,
      location: address || undefined,
    };

    addUserWalk(newWalk);
    console.log('Publish walk:', newWalk);
    cancelWalkCreation();
    setShowSuccess(true);
    if (successTimerRef.current) window.clearTimeout(successTimerRef.current);
    successTimerRef.current = window.setTimeout(() => {
      setShowSuccess(false);
      successTimerRef.current = null;
    }, 3000);
  }, [center, address, comment, buildWalkDate, addUserWalk, cancelWalkCreation]);

  const formattedTime = useMemo(() => {
    const now = new Date();
    const d = new Date(now);
    d.setDate(now.getDate() + timeValue.dayOffset);
    let dayLabel: string;
    if (timeValue.dayOffset === 0) dayLabel = t('Today');
    else if (timeValue.dayOffset === 1) dayLabel = t('Tomorrow');
    else {
      const dayName = d.toLocaleDateString('ru-RU', { weekday: 'short' });
      const dayNum = d.getDate();
      const mon = d.toLocaleDateString('ru-RU', { month: 'short' });
      dayLabel = `${dayName} ${dayNum} ${mon}`;
    }
    const hh = String(timeValue.hour).padStart(2, '0');
    const mm = String(timeValue.minute).padStart(2, '0');
    return `${dayLabel}, ${hh}:${mm}`;
  }, [timeValue, t]);

  if (!isMapRoute && !showSuccess) return null;

  // isMapMoving no longer in visibility calc — direct DOM handles it
  const locationVisible = walkCreationActive && step === 'location';
  const timeVisible = walkCreationActive && step === 'time';
  const commentVisible = walkCreationActive && step === 'comment';

  const drawerStyle = (visible: boolean, isActive: boolean): React.CSSProperties => ({
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: isActive ? 36 : 35,
    transform: visible ? 'translateY(0)' : 'translateY(100%)',
    opacity: visible ? 1 : 0,
    transition: STEP_TRANSITION,
    pointerEvents: visible ? 'auto' : 'none',
  });

  return (
    <>
      {/* Success toast */}
      {showSuccess && (
        <Toast
          message={t('Walk published!')}
          variant="success"
        />
      )}

      {walkCreationActive && (
        <>
          {/* Center pin — only on location step */}
          {step === 'location' && (
            <CenterMapPin
              top={pinViewportCenter.top}
              left={pinViewportCenter.left}
              pinRef={pinRef}
              shadowRef={pinShadowRef}
              initialPinTransform={WALK_PIN_REST_TRANSFORM}
              initialShadowTransform={WALK_SHADOW_REST_TRANSFORM}
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
                      <Icon name="paw-filled" size={24} color="#3F3F46" />
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
          )}

          {/* Dark overlay — fades in for steps 2 and 3 */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              zIndex: 28,
              pointerEvents: 'none',
              opacity: step !== 'location' ? 1 : 0,
              transition: 'opacity 0.35s ease',
            }}
          />

          {/* ── Step 1: Location ── */}
          <div
            ref={locationDrawerRef}
            style={drawerStyle(locationVisible, step === 'location')}
            className="bg-zinc-100 rounded-t-3xl px-5 pt-3 pb-10 flex flex-col gap-5 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
          >
            <div className="flex justify-center">
              <div className="w-14 h-1 bg-zinc-300 rounded-full" />
            </div>

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

            <div className="flex gap-3">
              <div className="flex-1">
                <Button variant="secondary-white" size="L" fullWidth onClick={handleCancel}>
                  {t('Back')}
                </Button>
              </div>
              <div className="flex-1">
                <Button
                  variant="primary"
                  size="L"
                  fullWidth
                  onClick={handleNext}
                  disabled={!address && !isLoadingAddress}
                >
                  {t('Next')}
                </Button>
              </div>
            </div>
          </div>

          {/* ── Step 2: Time ── */}
          <div
            style={drawerStyle(timeVisible, step === 'time')}
            className="bg-zinc-100 rounded-t-3xl px-5 pt-3 pb-10 flex flex-col gap-5 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
          >
            <div className="flex justify-center">
              <div className="w-14 h-1 bg-zinc-300 rounded-full" />
            </div>

            <Text variant="bold-24" color="primary">{t('Date and Time')}</Text>

            <TimePicker value={timeValue} onChange={setTimeValue} />

            <div className="flex gap-3">
              <div className="flex-1">
                <Button variant="secondary-white" size="L" fullWidth onClick={handleBack}>
                  {t('Back')}
                </Button>
              </div>
              <div className="flex-1">
                <Button variant="primary" size="L" fullWidth onClick={handleNext}>
                  {t('Next')}
                </Button>
              </div>
            </div>
          </div>

          {/* ── Step 3: Comment ── */}
          <div
            style={drawerStyle(commentVisible, step === 'comment')}
            className="bg-zinc-100 rounded-t-3xl px-5 pt-3 pb-10 flex flex-col gap-5 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
          >
            <div className="flex justify-center">
              <div className="w-14 h-1 bg-zinc-300 rounded-full" />
            </div>

            <div className="flex flex-wrap gap-2">
              {address && <Tag variant="outline" size="small">{address}</Tag>}
              <Tag variant="outline" size="small">{formattedTime}</Tag>
            </div>

            <Textarea
              placeholder={t('Walk comment placeholder')}
              value={comment}
              maxLength={200}
              rows={4}
              showCharCount
              onInput={setComment}
            />

            <div className="flex gap-3">
              <div className="flex-1">
                <Button variant="secondary-white" size="L" fullWidth onClick={handleBack}>
                  {t('Back')}
                </Button>
              </div>
              <div className="flex-1">
                <Button variant="primary" size="L" fullWidth onClick={handlePublish}>
                  {t('Publish')}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
