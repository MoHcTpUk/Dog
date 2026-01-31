import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MapView } from '@features/map';
import type { Location } from 'history';

interface LocationState {
  background?: Location;
}

export const PersistentMapLayer: React.FC = () => {
  const location = useLocation<LocationState>();
  const [isMapRoute, setIsMapRoute] = useState(false);

  useEffect(() => {
    // Проверяем background location, если drawer открыт
    const background = location.state?.background;
    const currentPath = background ? background.pathname : location.pathname;
    const shouldShow = currentPath.startsWith('/map');
    console.log('[PersistentMapLayer] Current path:', currentPath, 'shouldShow:', shouldShow);
    setIsMapRoute(shouldShow);
  }, [location.pathname, location.state]);

  console.log('[PersistentMapLayer] Rendering, isMapRoute:', isMapRoute);

  return (
    <div
      className="persistent-map-layer"
      style={{
        display: isMapRoute ? 'block' : 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: isMapRoute ? 1 : -1,
        pointerEvents: isMapRoute ? 'auto' : 'none',
      }}
    >
      <MapView isPaused={!isMapRoute} />
    </div>
  );
};
