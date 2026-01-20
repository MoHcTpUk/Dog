import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { WalkCard, NewWalkButton, Walk, PlaceCard, NewPlaceButton, PlaceCategory } from "@features/home";
import { Toggle, Icon, Tag } from "@shared/ui";
import { Text } from "@shared/ui/Text";
import { MainLayout } from "@app/layouts/MainLayout";
import { mockPlaces, placeCategories } from "@shared/mocks/places.mock";

const mockWalks: Walk[] = [
  {
    id: "1",
    organizerName: "Мария",
    organizerAvatar: "https://i.pravatar.cc/150?img=1",
    time: "Сегодня в 18:00",
    distance: "150 м от вас",
    description: "Привет! Ищем для прогулки девочек среднего размера",
    address: "Центральная 44",
    joinedDogs: [
      { id: "d1", avatar: "https://placehold.co/40x40/FF6B9D/white?text=D1" },
      { id: "d2", avatar: "https://placehold.co/40x40/C8B6FF/white?text=D2" },
      { id: "d3", avatar: "https://placehold.co/40x40/B4E7CE/white?text=D3" },
    ],
  },
  {
    id: "2",
    organizerName: "Алексей",
    organizerAvatar: "https://i.pravatar.cc/150?img=12",
    time: "Завтра в 21:00",
    distance: "400 м от вас",
    description: "Привет! Ищем для прогулки девочек среднего размера",
    address: "Центральная 44",
    joinedDogs: [
      { id: "d4", avatar: "https://placehold.co/40x40/FFD93D/white?text=D4" },
      { id: "d5", avatar: "https://placehold.co/40x40/6BCB77/white?text=D5" },
    ],
  },
  {
    id: "3",
    organizerName: "Екатерина",
    organizerAvatar: "https://i.pravatar.cc/150?img=5",
    time: "Сегодня в 16:30",
    distance: "Москва",
    description: "Привет! Ищем для прогулки девочек среднего размера",
    address: "Центральная 44",
    joinedDogs: [
      { id: "d6", avatar: "https://placehold.co/40x40/FF8787/white?text=D6" },
      { id: "d7", avatar: "https://placehold.co/40x40/4D96FF/white?text=D7" },
    ],
  },
  {
    id: "4",
    organizerName: "Дмитрий",
    organizerAvatar: "https://i.pravatar.cc/150?img=8",
    time: "Сегодня в 19:00",
    distance: "250 м от вас",
    description: "Ищем компанию для активной прогулки в парке",
    address: "Парк Горького",
    joinedDogs: [
      { id: "d8", avatar: "https://placehold.co/40x40/A8E6CF/white?text=D8" },
    ],
  },
  {
    id: "5",
    organizerName: "Анна",
    organizerAvatar: "https://i.pravatar.cc/150?img=9",
    time: "Завтра в 10:00",
    distance: "500 м от вас",
    description: "Утренняя прогулка с дружелюбными собаками",
    address: "Сквер у метро",
    joinedDogs: [
      { id: "d9", avatar: "https://placehold.co/40x40/FFB6B9/white?text=D9" },
      { id: "d10", avatar: "https://placehold.co/40x40/BFACE0/white?text=D10" },
      { id: "d11", avatar: "https://placehold.co/40x40/BAE1FF/white?text=D11" },
    ],
  },
];

// Мок данные для раздела "Мои прогулки"
const mockMyWalks: Walk[] = [
  {
    id: "my-1",
    organizerName: "Вы",
    organizerAvatar: "https://i.pravatar.cc/150?img=20",
    time: "Завтра в 12:40",
    distance: "250 м от вас",
    description: "Привет! Ищем для прогулки девочек среднего размера",
    address: "Центральная 44",
    kind: "own",
    joinedDogs: [
      { id: "my-d1", avatar: "https://placehold.co/40x40/FF6B9D/white?text=M1" },
    ],
  },
  {
    id: "my-2",
    organizerName: "Вы",
    organizerAvatar: "https://i.pravatar.cc/150?img=20",
    time: "Завтра в 15:00",
    distance: "250 м от вас",
    description: "Привет! Ищем для прогулки девочек среднего размера",
    address: "Центральная 44",
    kind: "request-sent",
    joinedDogs: [],
  },
  {
    id: "my-3",
    organizerName: "Вы",
    organizerAvatar: "https://i.pravatar.cc/150?img=20",
    time: "Завтра в 11:00",
    distance: "250 м от вас",
    description: "Привет! Ищем для прогулки девочек среднего размера",
    address: "Центральная 44",
    kind: "own-with-requests",
    requestCount: 1,
    joinedDogs: [],
  },
];

type TabValue = "walks" | "places";

export const HomePage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [activeTab, setActiveTab] = useState<TabValue>(
    (searchParams.get("tab") as TabValue) || "walks"
  );
  const [notificationCount] = useState(2);
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'favorites' | null>(null);

  useEffect(() => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set("tab", activeTab);

    const newSearch = newSearchParams.toString();
    if (location.search !== `?${newSearch}`) {
      history.replace({ search: newSearch });
    }
  }, [activeTab, history, location.search]);

  const handleNotificationClick = () => {
    history.push("/notifications");
  };

  const handleWalkClick = (walkId: string) => {
    history.push(`/walk/${walkId}`, { background: location });
  };

  const handlePlaceClick = (placeId: string) => {
    history.push(`/place/${placeId}`, { background: location });
  };

  const handleCategoryClick = (category: PlaceCategory | 'favorites') => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const filteredPlaces = selectedCategory
    ? selectedCategory === 'favorites'
      ? mockPlaces.filter((p) => p.isFavorite)
      : mockPlaces.filter((p) => p.category === selectedCategory)
    : mockPlaces;

  return (
    <MainLayout>
      <div className="px-3 py-5 flex flex-col justify-start items-start gap-8">
        <div className="self-stretch h-14 flex justify-between items-center">
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

        <div className="self-stretch flex flex-col justify-start items-center gap-10">
          {activeTab === "walks" && (
            <>
              <NewWalkButton />

              {mockMyWalks.length > 0 && (
                <div className="self-stretch flex flex-col justify-start items-start gap-5">
                  <div className="self-stretch flex justify-center items-center gap-2.5">
                    <Text
                      variant="bold-24"
                      color="primary"
                      className="flex-1 leading-6"
                    >
                      Мои прогулки
                    </Text>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-1">
                    {mockMyWalks.map((walk) => (
                      <WalkCard key={walk.id} walk={walk} onClick={handleWalkClick} />
                    ))}
                  </div>
                </div>
              )}

              <div className="self-stretch flex flex-col justify-start items-start gap-5">
                <div className="self-stretch flex justify-center items-center gap-2.5">
                  <Text
                    variant="bold-24"
                    color="primary"
                    className="flex-1 leading-6"
                  >
                    Прогулки рядом
                  </Text>
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-1">
                  {mockWalks.map((walk) => (
                    <WalkCard key={walk.id} walk={walk} onClick={handleWalkClick} />
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "places" && (
            <>
              <NewPlaceButton />

              <div className="self-stretch flex flex-col justify-start items-center gap-5">
                <div className="self-stretch flex justify-center items-center gap-2.5">
                  <Text
                    variant="bold-24"
                    color="primary"
                    className="flex-1 leading-6"
                  >
                    Места рядом
                  </Text>
                </div>

                <div className="self-stretch flex gap-1 overflow-x-auto scrollbar-hide -mx-3 px-3">
                  {placeCategories.map((cat) => (
                    <Tag
                      key={cat.value}
                      size="small"
                      selected={selectedCategory === cat.value}
                      onClick={() => handleCategoryClick(cat.value)}
                      icon={cat.icon ? <Icon name={cat.icon as any} size={16} /> : undefined}
                      className="flex-shrink-0"
                    >
                      {cat.label}
                    </Tag>
                  ))}
                </div>

                <div className="self-stretch flex flex-col justify-start items-start gap-1">
                  {filteredPlaces.map((place) => (
                    <PlaceCard key={place.id} place={place} onClick={handlePlaceClick} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
