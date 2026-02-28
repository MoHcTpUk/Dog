import React, { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Geolocation } from '@capacitor/geolocation';
import { MapView } from '@features/map';
import { useMapGL } from '@features/map/context';
import type { Location } from 'history';
import type { MapMarker } from '@features/map/types/map.types';

interface LocationState {
  background?: Location;
}

export const PersistentMapLayer: React.FC = () => {
  const location = useLocation<LocationState>();
  const { locationPickerActive, mapglAPI, mapInstance } = useMapGL();
  const userLocationMarkerRef = useRef<MapMarker | null>(null);
  const userLocationMarkerElementRef = useRef<HTMLDivElement | null>(null);

  const background = location.state?.background;
  const currentPath = background ? background.pathname : location.pathname;
  const isMapRoute = currentPath.startsWith('/map');
  const isVisible = isMapRoute || locationPickerActive;

  const destroyUserLocationMarker = useCallback(() => {
    userLocationMarkerRef.current?.destroy?.();
    userLocationMarkerRef.current = null;
    userLocationMarkerElementRef.current = null;
  }, []);

  const getUserLocationMarkerElement = useCallback(() => {
    if (userLocationMarkerElementRef.current) {
      return userLocationMarkerElementRef.current;
    }

    const outer = document.createElement('div');
    outer.style.width = '28px';
    outer.style.height = '28px';
    outer.style.borderRadius = '9999px';
    outer.style.background = 'rgba(37, 99, 235, 0.2)';
    outer.style.display = 'flex';
    outer.style.alignItems = 'center';
    outer.style.justifyContent = 'center';
    outer.style.transform = 'translate(-50%, -50%)';
    outer.style.pointerEvents = 'none';

    const inner = document.createElement('div');
    inner.style.width = '16px';
    inner.style.height = '16px';
    inner.style.borderRadius = '9999px';
    inner.style.background = '#2563EB';
    inner.style.border = '2px solid #FFFFFF';
    inner.style.boxSizing = 'border-box';

    outer.appendChild(inner);
    userLocationMarkerElementRef.current = outer;

    return outer;
  }, []);

  const syncUserLocationMarker = useCallback(async () => {
    if (!isVisible || !mapglAPI || !mapInstance) return;

    try {
      const position = await Geolocation.getCurrentPosition({ timeout: 5000 });
      const coordinates: [number, number] = [
        position.coords.longitude,
        position.coords.latitude,
      ];

      if (userLocationMarkerRef.current) {
        if (userLocationMarkerRef.current.setCoordinates) {
          userLocationMarkerRef.current.setCoordinates(coordinates);
          return;
        }

        userLocationMarkerRef.current.destroy?.();
        userLocationMarkerRef.current = null;
      }

      userLocationMarkerRef.current = new mapglAPI.HtmlMarker(mapInstance, {
        coordinates,
        html: getUserLocationMarkerElement(),
        anchor: [0, 0],
      });
    } catch {
      // Silently ignore geolocation errors
    }
  }, [getUserLocationMarkerElement, isVisible, mapInstance, mapglAPI]);

  useEffect(() => {
    destroyUserLocationMarker();
  }, [mapInstance, mapglAPI, destroyUserLocationMarker]);

  useEffect(() => {
    void syncUserLocationMarker();
  }, [syncUserLocationMarker]);

  useEffect(() => {
    return () => {
      destroyUserLocationMarker();
    };
  }, [destroyUserLocationMarker]);

  return (
    <div
      className="persistent-map-layer"
      style={{
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: isVisible ? 1 : -1,
        pointerEvents: isVisible ? 'auto' : 'none',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <MapView isPaused={!isVisible} />
    </div>
  );
};
