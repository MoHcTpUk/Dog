import React, { useRef, useMemo, useCallback, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Geolocation } from "@capacitor/geolocation";
import { MainLayout } from "@app/layouts/MainLayout";
import { type Place, useMapGL } from "@features/map/context";
import type { MapInstance } from "@features/map/types/map.types";
import { mockWalks } from "@shared/mocks/walks.mock";

let hasAutocenteredToUserLocation = false;
const MAP_MARKER_FOCUS_ZOOM = 17;

// Все места кластеризованы вокруг Парка Горького для демонстрации кластеров
const BASE_MOCK_PLACES: Place[] = [
  { id: "place-1", name: "Хлебник", coordinates: [37.6017, 55.7311], dogFriendly: true, category: "cafe" },
  { id: "place-2", name: "CityMall", coordinates: [37.6025, 55.7318], dogFriendly: true, category: "mall" },
  { id: "place-3", name: "Кофемания", coordinates: [37.6010, 55.7305], dogFriendly: true, category: "cafe" },
  { id: "place-4", name: "Парк Горького", coordinates: [37.5950, 55.7280], dogFriendly: true, category: "park" },
  { id: "place-5", name: "Бургер&Бар", coordinates: [37.6030, 55.7322], dogFriendly: true, category: "restaurant" },
  { id: "place-6", name: "Шоколадница", coordinates: [37.6015, 55.7308], dogFriendly: true, category: "cafe" },
  { id: "place-7", name: "Четыре лапы", coordinates: [37.6022, 55.7314], dogFriendly: true, category: "shop" },
  { id: "place-8", name: "Белуга", coordinates: [37.6008, 55.7316], dogFriendly: true, category: "restaurant" },
  { id: "place-9", name: "Собачья площадка ЦПКиО", coordinates: [37.6032, 55.7299], dogFriendly: true, category: "park" },
  { id: "place-10", name: "Кофе Хауз", coordinates: [37.6018, 55.7325], dogFriendly: true, category: "cafe" },
  { id: "place-11", name: "Бургер Кинг", coordinates: [37.6035, 55.7310], dogFriendly: true, category: "restaurant" },
  { id: "place-12", name: "Пятёрочка", coordinates: [37.6005, 55.7320], dogFriendly: true, category: "shop" },
];

export const MapPage: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const mapRef = useRef<MapInstance | null>(null);

  const {
    setDisplayedWalks,
    setDisplayedPlaces,
    setWalkClickHandler,
    setPlaceClickHandler,
    mapInstance,
    activeTab,
    walkCreationActive,
    placeCreationActive,
    startWalkCreation,
    placesCategoryFilter,
    userAddedWalks,
    userAddedPlaces,
  } = useMapGL();

  const locationRef = useRef(location);
  locationRef.current = location;

  const creationActive = walkCreationActive || placeCreationActive;

  const allPlaces = useMemo<Place[]>(
    () => [...BASE_MOCK_PLACES, ...userAddedPlaces],
    [userAddedPlaces]
  );
  const allWalks = useMemo(() => [...userAddedWalks, ...mockWalks], [userAddedWalks]);

  const displayedPlaces = useMemo(() => {
    if (creationActive) return [];
    if (activeTab !== "places") return [];
    const dogFriendly = allPlaces.filter((p) => p.dogFriendly);
    if (!placesCategoryFilter) return dogFriendly;
    return dogFriendly.filter((p) => p.category === placesCategoryFilter);
  }, [activeTab, creationActive, allPlaces, placesCategoryFilter]);

  const displayedWalks = useMemo(() => {
    if (creationActive) return [];
    return activeTab === "walks" ? allWalks : [];
  }, [activeTab, creationActive, allWalks]);

  const handleWalkClick = useCallback(
    (walkId: string) => {
      const walk = allWalks.find((item) => item.id === walkId);
      if (walk && mapInstance) {
        mapInstance.setCenter(walk.coordinates);
        const currentZoom = mapInstance.getZoom();
        if (currentZoom < MAP_MARKER_FOCUS_ZOOM) {
          mapInstance.setZoom(MAP_MARKER_FOCUS_ZOOM);
        }
      }

      const cleanLocation = { ...locationRef.current, search: "" };
      history.push(`/walk/${walkId}`, { background: cleanLocation });
    },
    [allWalks, history, mapInstance],
  );

  const handlePlaceClick = useCallback(
    (placeId: string) => {
      const place = allPlaces.find((p) => p.id === placeId);
      if (place && mapInstance) {
        mapInstance.setCenter(place.coordinates);
        const currentZoom = mapInstance.getZoom();
        if (currentZoom < MAP_MARKER_FOCUS_ZOOM) {
          mapInstance.setZoom(MAP_MARKER_FOCUS_ZOOM);
        }
      }
      const cleanLocation = { ...locationRef.current, search: "" };
      history.push(`/place/${placeId}`, { background: cleanLocation });
    },
    [history, allPlaces, mapInstance],
  );

  useEffect(() => {
    setDisplayedWalks(displayedWalks);
    setDisplayedPlaces(displayedPlaces);
  }, [displayedWalks, displayedPlaces, setDisplayedWalks, setDisplayedPlaces]);

  useEffect(() => {
    setWalkClickHandler(handleWalkClick);
  }, [handleWalkClick, setWalkClickHandler]);

  useEffect(() => {
    setPlaceClickHandler(handlePlaceClick);
  }, [handlePlaceClick, setPlaceClickHandler]);

  useEffect(() => {
    if (mapInstance) {
      mapRef.current = mapInstance;
    }
  }, [mapInstance]);

  useEffect(() => {
    if (!mapInstance || hasAutocenteredToUserLocation) return;
    hasAutocenteredToUserLocation = true;

    Geolocation.getCurrentPosition({ timeout: 5000 })
      .then((pos) => {
        mapInstance.setCenter([pos.coords.longitude, pos.coords.latitude]);
        mapInstance.setZoom(13);
      })
      .catch(() => {});
  }, [mapInstance]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!params.has('createWalk') || walkCreationActive) return;

    params.delete('createWalk');
    history.replace({ search: params.toString() });

    Geolocation.getCurrentPosition({ timeout: 5000 })
      .then((pos) => {
        if (mapInstance) {
          mapInstance.setCenter([pos.coords.longitude, pos.coords.latitude]);
          mapInstance.setZoom(15);
        }
      })
      .catch(() => {})
      .finally(() => {
        startWalkCreation();
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  return (
    <MainLayout withFooter>
      <div className="absolute inset-0" />
    </MainLayout>
  );
};
