import React from 'react';
import { useLocation } from 'react-router-dom';
import { MapView } from '@features/map';
import { useMapGL } from '@features/map/context';
import type { Location } from 'history';

interface LocationState {
  background?: Location;
}

export const PersistentMapLayer: React.FC = () => {
  const location = useLocation<LocationState>();
  const { locationPickerActive } = useMapGL();

  const background = location.state?.background;
  const currentPath = background ? background.pathname : location.pathname;
  const isMapRoute = currentPath.startsWith('/map');
  const isVisible = isMapRoute || locationPickerActive;

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
