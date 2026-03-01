import type { MapTab } from "@features/map/context";
import type { MapPlace, PlaceCategory } from "@shared/types/place";
import type { Walk } from "@shared/types/walk";
import type { Location } from "history";

interface GetDisplayedMapPlacesOptions {
  activeTab: MapTab;
  creationActive: boolean;
  places: MapPlace[];
  placesCategoryFilter: PlaceCategory | null;
}

interface GetDisplayedMapWalksOptions {
  activeTab: MapTab;
  creationActive: boolean;
  walks: Walk[];
}

interface GetMapPageStateOptions {
  activeTab: MapTab;
  creationActive: boolean;
  basePlaces: MapPlace[];
  userAddedPlaces: MapPlace[];
  baseWalks: Walk[];
  userAddedWalks: Walk[];
  placesCategoryFilter: PlaceCategory | null;
}

export const getAllMapPlaces = (
  basePlaces: MapPlace[],
  userAddedPlaces: MapPlace[],
) => [...basePlaces, ...userAddedPlaces];

export const getAllMapWalks = (baseWalks: Walk[], userAddedWalks: Walk[]) => [
  ...userAddedWalks,
  ...baseWalks,
];

export const getDisplayedMapPlaces = ({
  activeTab,
  creationActive,
  places,
  placesCategoryFilter,
}: GetDisplayedMapPlacesOptions) => {
  if (creationActive || activeTab !== "places") {
    return [];
  }

  const dogFriendlyPlaces = places.filter((place) => place.dogFriendly);

  if (!placesCategoryFilter) {
    return dogFriendlyPlaces;
  }

  return dogFriendlyPlaces.filter(
    (place) => place.category === placesCategoryFilter,
  );
};

export const getDisplayedMapWalks = ({
  activeTab,
  creationActive,
  walks,
}: GetDisplayedMapWalksOptions) => {
  if (creationActive || activeTab !== "walks") {
    return [];
  }

  return walks;
};

export const getMapPageState = ({
  activeTab,
  creationActive,
  basePlaces,
  userAddedPlaces,
  baseWalks,
  userAddedWalks,
  placesCategoryFilter,
}: GetMapPageStateOptions) => {
  const allPlaces = getAllMapPlaces(basePlaces, userAddedPlaces);
  const allWalks = getAllMapWalks(baseWalks, userAddedWalks);

  return {
    allPlaces,
    allWalks,
    displayedPlaces: getDisplayedMapPlaces({
      activeTab,
      creationActive,
      places: allPlaces,
      placesCategoryFilter,
    }),
    displayedWalks: getDisplayedMapWalks({
      activeTab,
      creationActive,
      walks: allWalks,
    }),
  };
};

export const createMapOverlayBackgroundLocation = (
  location: Location,
): Location => ({
  ...location,
  search: "",
});

export const hasSearchParam = (search: string, key: string) =>
  new URLSearchParams(search).has(key);

export const removeSearchParam = (search: string, key: string) => {
  const params = new URLSearchParams(search);
  params.delete(key);
  return params.toString();
};
