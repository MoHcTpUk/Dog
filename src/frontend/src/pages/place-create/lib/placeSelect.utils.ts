import type { NearbyPlace } from "@shared/api/overpass";
import type { MapPlace } from "@shared/types/place";

const PLACE_SELECT_DEFAULT_LIMIT = 15;

export const PLACE_CATEGORY_LABEL_KEYS: Record<NearbyPlace["category"], string> = {
  cafe: "Coffee shops",
  restaurant: "Restaurants",
  shop: "Shops",
  mall: "Malls",
  park: "Parks",
  other: "Place",
};

export interface PlaceSelectLocationState {
  nearbyPlaces?: NearbyPlace[];
}

export const getNearbyPlacesFromLocationState = (
  state?: PlaceSelectLocationState,
) => state?.nearbyPlaces ?? [];

export const formatPlaceAddressFromTags = (place: NearbyPlace) => {
  const street = place.tags["addr:street"];
  const house = place.tags["addr:housenumber"];

  if (street && house) {
    return `${street} ${house}`;
  }

  if (street) {
    return street;
  }

  return place.name;
};

export const filterNearbyPlaces = (
  nearbyPlaces: NearbyPlace[],
  searchQuery: string,
) => {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    return nearbyPlaces.slice(0, PLACE_SELECT_DEFAULT_LIMIT);
  }

  return nearbyPlaces.filter((place) =>
    place.name.toLowerCase().includes(normalizedQuery),
  );
};

export const toggleSelectedPlaceId = (
  selectedPlaceId: string | null,
  placeId: string,
) => (selectedPlaceId === placeId ? null : placeId);

export const buildUserAddedPlace = (
  place: NearbyPlace,
  translate: (key: string) => string,
): MapPlace => ({
  id: place.id,
  name: place.name,
  coordinates: place.coordinates,
  dogFriendly: true,
  category: place.category,
  categoryLabel: translate(PLACE_CATEGORY_LABEL_KEYS[place.category]),
  distance: translate("New place on the map"),
  address: formatPlaceAddressFromTags(place),
  workingHours: place.tags.opening_hours,
  description:
    place.tags.description ||
    translate("Place added by user and available on the map"),
  isFavorite: false,
});
