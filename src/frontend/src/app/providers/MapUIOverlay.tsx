import React, { useEffect, useCallback, useMemo } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Toggle, Icon, Button, Tag, RoundIconButton } from '@shared/ui';
import { Text } from '@shared/ui/Text';
import type { ToggleOption } from '@shared/ui/Toggle';
import { type MapTab, useMapGL } from '@features/map/context';
import type { PlaceCategory } from '@shared/types/place';
import {
  centerMapOnUserLocation,
  isMapOverlayRoute,
  type MapOverlayLocationState,
  MAP_ACTION_LABELS,
  MAP_MY_PLACES_LABEL_KEY,
  MAP_NOTIFICATION_COUNT,
  MAP_PLACE_CATEGORY_OPTIONS,
  MAP_TAB_OPTIONS,
  MAP_TAB_QUERY_PARAM,
} from '@features/map/lib';

export const MapUIOverlay: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation<MapOverlayLocationState>();
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
  const isMapRoute = isMapOverlayRoute(location.pathname, location.state);
  const toggleOptions = useMemo(
    () =>
      MAP_TAB_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
      })) as [ToggleOption<MapTab>, ToggleOption<MapTab>],
    [t],
  );

  useEffect(() => {
    if (!isMapRoute) return;
    if (location.pathname !== '/map') return;

    const params = new URLSearchParams(location.search);
    const tabParam = params.get(MAP_TAB_QUERY_PARAM) as MapTab | null;

    if (tabParam === 'walks' || tabParam === 'places') {
      if (tabParam !== activeTab) {
        setActiveTab(tabParam);
      }
    } else if (!params.has(MAP_TAB_QUERY_PARAM)) {
      params.set(MAP_TAB_QUERY_PARAM, 'walks');
      history.replace({ search: params.toString() });
    }
  }, [isMapRoute, location.pathname, location.search, activeTab, setActiveTab, history]);

  const handleNotificationClick = useCallback(() => {
    history.push('/notifications');
  }, [history]);

  const handleCenterLocation = useCallback(async () => {
    await centerMapOnUserLocation(mapInstance);
  }, [mapInstance]);

  const handleTabChange = useCallback((tab: MapTab) => {
    setActiveTab(tab);

    if (tab !== 'places') {
      setPlacesCategoryFilter(null);
    }

    if (location.pathname === '/map') {
      const params = new URLSearchParams(location.search);
      params.set(MAP_TAB_QUERY_PARAM, tab);
      history.replace({ search: params.toString() });
    }
  }, [setActiveTab, setPlacesCategoryFilter, location.pathname, location.search, history]);

  const handleCategoryClick = useCallback((category: PlaceCategory) => {
    setPlacesCategoryFilter(placesCategoryFilter === category ? null : category);
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
            options={toggleOptions}
            value={activeTab}
            onChange={handleTabChange}
          />
          <div className="relative">
            <RoundIconButton
              onClick={handleNotificationClick}
              rotateContent
              className="p-3"
            >
              <Icon name="bell" size={24} color="var(--color-text-primary)" />
            </RoundIconButton>
            {MAP_NOTIFICATION_COUNT > 0 && (
              <div className="absolute min-w-5 px-1.5 py-0.5 left-[29px] top-[-9px] bg-pink-300 rounded-full flex flex-col justify-center items-center">
                <Text variant="medium-14" color="white">
                  {MAP_NOTIFICATION_COUNT}
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
                {t(MAP_MY_PLACES_LABEL_KEY)}
              </Tag>
            </div>

            {MAP_PLACE_CATEGORY_OPTIONS.map((category) => (
              <div key={category.value} className="flex-shrink-0">
                <Tag
                  size="small"
                  selected={placesCategoryFilter === category.value}
                  icon={<Icon name={category.icon} size={16} />}
                  onClick={() => handleCategoryClick(category.value)}
                >
                  {t(category.labelKey)}
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
            {t(MAP_ACTION_LABELS.walks)}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="M"
            onClick={startPlaceCreation}
            icon={<Icon name="plus" size={24} color="white" />}
            iconPosition="left"
          >
            {t(MAP_ACTION_LABELS.places)}
          </Button>
        )}

        <RoundIconButton
          onClick={handleCenterLocation}
          rotateContent
          className="p-3 gap-2.5 overflow-hidden"
        >
          <Icon name="plane" size={24} color="var(--color-text-primary)" />
        </RoundIconButton>
      </div>
    </div>
  );
};
