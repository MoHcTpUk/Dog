import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useIonRouter } from '@ionic/react';
import { Toggle, Icon, Button } from '@shared/ui';
import { Text } from '@shared/ui/Text';
import { useMapGL } from '@features/map/context';
import { Geolocation } from '@capacitor/geolocation';
import type { Location } from 'history';

interface LocationState {
  background?: Location;
}

export const MapUIOverlay: React.FC = () => {
  const location = useLocation<LocationState>();
  const history = useHistory();
  const router = useIonRouter();
  const { activeTab, setActiveTab, mapInstance } = useMapGL();
  const [isMapRoute, setIsMapRoute] = useState(false);
  const [notificationCount] = useState(2);

  // Определяем находимся ли на странице карты (проверяем background location)
  useEffect(() => {
    const background = location.state?.background;
    const currentPath = background ? background.pathname : location.pathname;
    const shouldShow = currentPath.startsWith('/map');
    setIsMapRoute(shouldShow);
  }, [location.pathname, location.state]);

  // Синхронизация activeTab с URL query параметром при переходе на /map
  useEffect(() => {
    if (!isMapRoute) return;

    // Работаем только с реальным /map маршрутом, не с drawer'ами поверх карты
    const isRealMapRoute = location.pathname === '/map';
    if (!isRealMapRoute) return;

    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab') as 'walks' | 'places' | null;

    // Если в URL есть tab параметр - используем его
    if (tabParam === 'walks' || tabParam === 'places') {
      if (tabParam !== activeTab) {
        setActiveTab(tabParam);
      }
    } else if (!params.has('tab')) {
      // Если параметра нет - добавляем дефолтный
      params.set('tab', 'walks');
      history.replace({ search: params.toString() });
    }
  }, [isMapRoute, location.pathname, location.search, activeTab, setActiveTab, history]);

  const handleNotificationClick = useCallback(() => {
    router.push('/notifications', 'forward', 'push');
  }, [router]);

  const handleNewWalk = useCallback(() => {
    router.push('/walk/new', 'forward', 'push');
  }, [router]);

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

  // Обработчик изменения таба - обновляем URL
  const handleTabChange = useCallback((tab: 'walks' | 'places') => {
    setActiveTab(tab);
    // Обновляем URL только если мы на реальном /map маршруте
    if (location.pathname === '/map') {
      const params = new URLSearchParams(location.search);
      params.set('tab', tab);
      history.replace({ search: params.toString() });
    }
  }, [setActiveTab, location.pathname, location.search, history]);

  if (!isMapRoute) return null;

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
      {/* Верхняя панель */}
      <div className="absolute top-0 left-0 right-0 px-3 pt-5 flex justify-between items-center" style={{ pointerEvents: 'auto' }}>
        <Toggle
          options={[
            { value: 'walks', label: 'Прогулки' },
            { value: 'places', label: 'Места' },
          ]}
          value={activeTab}
          onChange={handleTabChange}
        />
        <div
          className="relative cursor-pointer"
          onClick={handleNotificationClick}
        >
          <div className="p-3 -rotate-90 bg-white rounded-full shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)] flex flex-col justify-center items-center">
            <div className="rotate-90">
              <Icon name="bell" size={24} />
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

      {/* Нижние кнопки */}
      <div className="absolute bottom-[100px] left-0 right-0 px-3 flex justify-between items-center gap-3" style={{ pointerEvents: 'auto' }}>
        <Button
          variant="primary"
          size="M"
          onClick={handleNewWalk}
          icon={<Icon name="plus" size={24} color="white" />}
          iconPosition="left"
        >
          Прогулка
        </Button>

        <button
          onClick={handleCenterLocation}
          className="p-3 -rotate-90 bg-white rounded-full shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)] inline-flex flex-col justify-center items-center gap-2.5 overflow-hidden"
        >
          <div className="rotate-90">
            <Icon name="plane" size={24} />
          </div>
        </button>
      </div>
    </div>
  );
};
