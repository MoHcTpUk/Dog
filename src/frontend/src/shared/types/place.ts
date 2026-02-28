export type PlaceCategory = 'cafe' | 'restaurant' | 'shop' | 'mall' | 'park' | 'other';

export interface PlaceCluster {
  id: string;
  center: [number, number];
  placeCount: number;
}
