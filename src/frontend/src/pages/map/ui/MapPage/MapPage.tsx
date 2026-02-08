import React, { useRef, useMemo, useCallback, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { MainLayout } from "@app/layouts/MainLayout";
import { type Place, useMapGL } from "@features/map/context";
import type { MapInstance } from "@features/map/types/map.types";
import { mockWalks } from "@shared/mocks/walks.mock";

const mockPlaces: Place[] = [
  {
    id: "1",
    name: "Парк Горького",
    coordinates: [37.6017, 55.7311],
    dogFriendly: true,
  },
  {
    id: "2",
    name: "Воробьевы горы",
    coordinates: [37.5433, 55.7102],
    dogFriendly: true,
  },
  {
    id: "3",
    name: "Парк Сокольники",
    coordinates: [37.6781, 55.7953],
    dogFriendly: true,
  },
  {
    id: "4",
    name: "ВДНХ",
    coordinates: [37.6269, 55.8304],
    dogFriendly: true,
  },
];

export const MapPage: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const mapRef = useRef<MapInstance | null>(null);

  const {
    setDisplayedWalks,
    setDisplayedPlaces,
    setWalkClickHandler,
    mapInstance,
    activeTab,
  } = useMapGL();

  const displayedPlaces = useMemo(() => {
    return activeTab === "places"
      ? mockPlaces.filter((place) => place.dogFriendly)
      : [];
  }, [activeTab]);

  const displayedWalks = useMemo(() => {
    return activeTab === "walks" ? mockWalks : [];
  }, [activeTab]);

  const handleWalkClick = useCallback(
    (walkId: string) => {
      // Передаём background без query параметров, чтобы избежать переноса ?tab=walks
      const cleanLocation = {
        ...location,
        search: "",
      };
      history.push(`/walk/${walkId}`, { background: cleanLocation });
    },
    [location, history],
  );

  // Update map context when tab or data changes
  useEffect(() => {
    setDisplayedWalks(displayedWalks);
    setDisplayedPlaces(displayedPlaces);
  }, [displayedWalks, displayedPlaces, setDisplayedWalks, setDisplayedPlaces]);

  // Update walk click handler
  useEffect(() => {
    setWalkClickHandler(handleWalkClick);
  }, [handleWalkClick, setWalkClickHandler]);

  // Update mapRef when mapInstance changes
  useEffect(() => {
    if (mapInstance) {
      mapRef.current = mapInstance;
    }
  }, [mapInstance]);

  return (
    <MainLayout withFooter>
      <div className="absolute inset-0">
        {/* Карта рендерится через PersistentMapLayer в AppRoutes.tsx */}
        {/* UI элементы рендерятся через MapUIOverlay в AppRoutes.tsx */}
      </div>
    </MainLayout>
  );
};
