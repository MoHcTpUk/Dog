export type PlaceCategory =
  | "cafe"
  | "restaurant"
  | "shop"
  | "mall"
  | "park"
  | "other";

export interface MapPlace {
  id: string;
  name: string;
  coordinates: [number, number];
  dogFriendly: boolean;
  category?: PlaceCategory;
  categoryLabel?: string;
  distance?: string;
  address?: string;
  workingHours?: string;
  description?: string;
  photos?: string[];
  isFavorite?: boolean;
}

export interface PlaceCluster {
  id: string;
  center: [number, number];
  placeCount: number;
}
