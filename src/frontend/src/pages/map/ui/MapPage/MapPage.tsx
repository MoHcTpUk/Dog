import React, { useState, useRef, useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Toggle, Icon, Button } from "@shared/ui";
import { Text } from "@shared/ui/Text";
import { MainLayout } from "@app/layouts/MainLayout";
import { MapView, type Place } from "@features/map";
import type { MapInstance } from "@features/map/types/map.types";
import { Geolocation } from "@capacitor/geolocation";
import { mockWalks } from "@shared/mocks/walks.mock";

type TabValue = "walks" | "places";

// Моковые данные для мест (временно, пока не готов API)
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
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [activeTab, setActiveTab] = useState<TabValue>(
    (searchParams.get("tab") as TabValue) || "walks"
  );
  const [notificationCount] = useState(2);
  const mapRef = useRef<MapInstance | null>(null);

  const displayedPlaces = useMemo(() => {
    return activeTab === "places"
      ? mockPlaces.filter((place) => place.dogFriendly)
      : [];
  }, [activeTab]);

  const displayedWalks = useMemo(() => {
    return activeTab === "walks" ? mockWalks : [];
  }, [activeTab]);

  const handleNotificationClick = () => {
    history.push("/notifications");
  };

  const handleCenterLocation = async () => {
    try {
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      if (mapRef.current) {
        mapRef.current.setCenter([longitude, latitude]);
        mapRef.current.setZoom(15);
      }
    } catch (error) {
      console.error("Ошибка получения геолокации:", error);
    }
  };

  const handleNewWalk = () => {
    history.push("/walk/new");
  };

  const handleMapReady = (map: MapInstance) => {
    mapRef.current = map;
  };

  return (
    <MainLayout>
      <div className="absolute inset-0">
        {/* Карта на весь экран */}
        <MapView
          onMapReady={handleMapReady}
          places={displayedPlaces}
          walks={displayedWalks}
        />

        {/* Верхняя панель поверх карты */}
        <div className="absolute top-0 left-0 right-0 px-3 pt-5 flex justify-between items-center z-10">
          <Toggle
            options={[
              { value: "walks", label: "Прогулки" },
              { value: "places", label: "Места" },
            ]}
            value={activeTab}
            onChange={setActiveTab}
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

        {/* Нижние кнопки поверх карты - 12px выше футера */}
        <div className="absolute bottom-[100px] left-0 right-0 px-3 flex justify-between items-center gap-3 z-10">
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
    </MainLayout>
  );
};
