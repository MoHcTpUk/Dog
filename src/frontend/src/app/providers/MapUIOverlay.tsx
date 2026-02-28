import React, { useEffect, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { Toggle, Icon, Button, Tag } from '@shared/ui';
import { Text } from '@shared/ui/Text';
import { useMapGL } from '@features/map/context';
import type { PlaceCategory } from '@shared/types/place';
import { Geolocation } from '@capacitor/geolocation';
import type { Location } from 'history';
import type { IconName } from '@shared/ui/Icon';

interface LocationState {
  background?: Location;
}

const PLACE_CATEGORIES: { value: PlaceCategory; label: string; icon: IconName }[] = [
  { value: 'cafe',       label: 'Кофейни',   icon: 'cafe'       },
  { value: 'shop',       label: 'Магазины',  icon: 'shop'       },
  { value: 'restaurant', label: 'Рестораны', icon: 'restaurant' },
  { value: 'mall',       label: 'ТЦ',        icon: 'mall'       },
  { value: 'park',       label: 'Парки',     icon: 'park'       },
];

export const MapUIOverlay: React.FC = () => {
  const location = useLocation<LocationState>();
  const history = useHistory();
  const {
    activeTab,
    setActiveTab,
    mapInstance,
    walkCreationActive,
    startWalkCreation,
    placeCreationActive,
    startPlaceCreation,
    placesCategoryFilter,
    setPlacesCategoryFilter,
  } = useMapGL();
  const background = location.state?.background;
  const currentPath = background ? background.pathname : location.pathname;
  const isMapRoute = currentPath.startsWith('/map');
  const notificationCount = 2;

  useEffect(() => {
    if (!isMapRoute) return;
    if (location.pathname !== '/map') return;

    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab') as 'walks' | 'places' | null;

    if (tabParam === 'walks' || tabParam === 'places') {
      if (tabParam !== activeTab) {
        setActiveTab(tabParam);
      }
    } else if (!params.has('tab')) {
      params.set('tab', 'walks');
      history.replace({ search: params.toString() });
    }
  }, [isMapRoute, location.pathname, location.search, activeTab, setActiveTab, history]);

  const handleNotificationClick = useCallback(() => {
    history.push('/notifications');
  }, [history]);

  const handleCenterLocation = useCallback(async () => {
    try {
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      if (mapInstance) {
        mapInstance.setCenter([longitude, latitude]);
        mapInstance.setZoom(15);
      }
    } catch {
      // Silently handle geolocation errors
    }
  }, [mapInstance]);

  const handleTabChange = useCallback((tab: 'walks' | 'places') => {
    setActiveTab(tab);
    // Reset category filter when switching tabs
    if (tab !== 'places') {
      setPlacesCategoryFilter(null);
    }
    if (location.pathname === '/map') {
      const params = new URLSearchParams(location.search);
      params.set('tab', tab);
      history.replace({ search: params.toString() });
    }
  }, [setActiveTab, setPlacesCategoryFilter, location.pathname, location.search, history]);

  const handleCategoryClick = useCallback((cat: PlaceCategory) => {
    setPlacesCategoryFilter(placesCategoryFilter === cat ? null : cat);
  }, [placesCategoryFilter, setPlacesCategoryFilter]);

  if (!isMapRoute || walkCreationActive || placeCreationActive) return null;

  return (
    <div
      className="map-ui-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 20,
      }}
    >
      {/* Top panel */}
      <div
        className="absolute top-0 left-0 right-0 px-3 pt-5 flex flex-col gap-3"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Toggle + notification */}
        <div className="flex justify-between items-center">
          <Toggle
            options={[
              { value: 'walks', label: 'Прогулки' },
              { value: 'places', label: 'Места' },
            ]}
            value={activeTab}
            onChange={handleTabChange}
          />
          <div className="relative cursor-pointer" onClick={handleNotificationClick}>
            <div className="p-3 -rotate-90 bg-white rounded-full shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)] flex flex-col justify-center items-center">
              <div className="rotate-90">
                <Icon name="bell" size={24} color="var(--color-text-primary)" />
              </div>
            </div>
            {notificationCount > 0 && (
              <div className="absolute min-w-5 px-1.5 py-0.5 left-[29px] top-[-9px] bg-pink-300 rounded-full flex flex-col justify-center items-center">
                <Text variant="medium-14" color="white">
                  {notificationCount}
                </Text>
              </div>
            )}
          </div>
        </div>

        {/* Category filter row — visible only on places tab */}
        {activeTab === 'places' && (
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* "Мои места" — сбрасывает фильтр */}
            <div className="flex-shrink-0">
              <Tag
                size="small"
                selected={placesCategoryFilter === null}
                icon={<Icon name="star" size={16} />}
                onClick={() => setPlacesCategoryFilter(null)}
              >
                Мои места
              </Tag>
            </div>

            {PLACE_CATEGORIES.map((cat) => (
              <div key={cat.value} className="flex-shrink-0">
                <Tag
                  size="small"
                  selected={placesCategoryFilter === cat.value}
                  icon={<Icon name={cat.icon} size={16} />}
                  onClick={() => handleCategoryClick(cat.value)}
                >
                  {cat.label}
                </Tag>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom buttons */}
      <div
        className="absolute bottom-[100px] left-0 right-0 px-3 flex justify-between items-center gap-3"
        style={{ pointerEvents: 'auto' }}
      >
        {activeTab === 'walks' ? (
          <Button
            variant="primary"
            size="M"
            onClick={startWalkCreation}
            icon={<Icon name="plus" size={24} color="white" />}
            iconPosition="left"
          >
            Прогулка
          </Button>
        ) : (
          <Button
            variant="primary"
            size="M"
            onClick={startPlaceCreation}
            icon={<Icon name="plus" size={24} color="white" />}
            iconPosition="left"
          >
            Место
          </Button>
        )}

        <button
          onClick={handleCenterLocation}
          className="p-3 -rotate-90 bg-white rounded-full shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)] inline-flex flex-col justify-center items-center gap-2.5 overflow-hidden"
        >
          <div className="rotate-90">
            <Icon name="plane" size={24} color="var(--color-text-primary)" />
          </div>
        </button>
      </div>
    </div>
  );
};
