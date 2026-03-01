import type { IconName } from "@shared/ui/Icon";
import type { MapPlace, PlaceCategory } from "@shared/types/place";
import type { MapTab } from "../context";

export const MAP_DEFAULT_CENTER: [number, number] = [37.573856, 55.751574];
export const MAP_DEFAULT_ZOOM = 12;
export const MAP_INITIAL_USER_LOCATION_ZOOM = 13;
export const MAP_USER_LOCATION_ZOOM = 15;
export const MAP_MARKER_FOCUS_ZOOM = 17;
export const MAP_NOTIFICATION_COUNT = 2;

export const MAP_TAB_QUERY_PARAM = "tab";
export const MAP_CREATE_WALK_QUERY_PARAM = "createWalk";

export const MAP_TAB_OPTIONS: Array<{ value: MapTab; labelKey: string }> = [
  { value: "walks", labelKey: "Walks" },
  { value: "places", labelKey: "Places" },
];

export const MAP_PLACE_CATEGORY_OPTIONS: Array<{
  value: PlaceCategory;
  labelKey: string;
  icon: IconName;
}> = [
  { value: "cafe", labelKey: "Coffee shops", icon: "cafe" },
  { value: "shop", labelKey: "Shops", icon: "shop" },
  { value: "restaurant", labelKey: "Restaurants", icon: "restaurant" },
  { value: "mall", labelKey: "Malls", icon: "mall" },
  { value: "park", labelKey: "Parks", icon: "park" },
];

export const MAP_MY_PLACES_LABEL_KEY = "My places";

export const MAP_ACTION_LABELS: Record<MapTab, string> = {
  walks: "Walk",
  places: "Place",
};

// Demo places kept in the map feature because they are only used to render map markers.
export const MAP_MOCK_PLACES: MapPlace[] = [
  {
    id: "place-1",
    name: "Хлебник",
    coordinates: [37.6017, 55.7311],
    dogFriendly: true,
    category: "cafe",
  },
  {
    id: "place-2",
    name: "CityMall",
    coordinates: [37.6025, 55.7318],
    dogFriendly: true,
    category: "mall",
  },
  {
    id: "place-3",
    name: "Кофемания",
    coordinates: [37.601, 55.7305],
    dogFriendly: true,
    category: "cafe",
  },
  {
    id: "place-4",
    name: "Парк Горького",
    coordinates: [37.595, 55.728],
    dogFriendly: true,
    category: "park",
  },
  {
    id: "place-5",
    name: "Бургер&Бар",
    coordinates: [37.603, 55.7322],
    dogFriendly: true,
    category: "restaurant",
  },
  {
    id: "place-6",
    name: "Шоколадница",
    coordinates: [37.6015, 55.7308],
    dogFriendly: true,
    category: "cafe",
  },
  {
    id: "place-7",
    name: "Четыре лапы",
    coordinates: [37.6022, 55.7314],
    dogFriendly: true,
    category: "shop",
  },
  {
    id: "place-8",
    name: "Белуга",
    coordinates: [37.6008, 55.7316],
    dogFriendly: true,
    category: "restaurant",
  },
  {
    id: "place-9",
    name: "Собачья площадка ЦПКиО",
    coordinates: [37.6032, 55.7299],
    dogFriendly: true,
    category: "park",
  },
  {
    id: "place-10",
    name: "Кофе Хауз",
    coordinates: [37.6018, 55.7325],
    dogFriendly: true,
    category: "cafe",
  },
  {
    id: "place-11",
    name: "Бургер Кинг",
    coordinates: [37.6035, 55.731],
    dogFriendly: true,
    category: "restaurant",
  },
  {
    id: "place-12",
    name: "Пятёрочка",
    coordinates: [37.6005, 55.732],
    dogFriendly: true,
    category: "shop",
  },
];
