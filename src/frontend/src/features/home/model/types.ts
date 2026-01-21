export type WalkKind = 'regular' | 'own' | 'own-with-requests' | 'request-sent';

export interface Walk {
  id: string;
  organizerName: string;
  organizerAvatar: string;
  time: string;
  distance: string;
  description: string;
  address: string;
  joinedDogs: Array<{
    id: string;
    avatar: string;
  }>;
  kind?: WalkKind;
  requestCount?: number;
}

export type PlaceCategory = 'cafe' | 'restaurant' | 'shop' | 'mall' | 'park' | 'cocktail';

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  categoryLabel: string;
  distance: string;
  address: string;
  workingHours?: string;
  description?: string;
  photos?: string[];
  isFavorite?: boolean;
}
