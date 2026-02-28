import type { PlaceCategory } from '@shared/types/place';
import { haversineDistance } from '@shared/utils/geo.utils';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export interface NearbyPlace {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number]; // [lng, lat] — порядок как в 2GIS
  category: PlaceCategory;
  tags: Record<string, string>;
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

/** Маппинг OSM-тегов на категорию места */
export function getCategoryFromTags(tags: Record<string, string>): PlaceCategory {
  const amenity = tags.amenity ?? '';
  const shop = tags.shop ?? '';
  const leisure = tags.leisure ?? '';
  const cuisine = tags.cuisine ?? '';

  if (amenity === 'cafe' || amenity === 'coffee_shop' || cuisine.includes('coffee')) return 'cafe';
  if (amenity === 'restaurant' || amenity === 'bar' || amenity === 'pub' || amenity === 'fast_food') return 'restaurant';
  if (shop === 'mall' || shop === 'department_store') return 'mall';
  if (leisure === 'park' || leisure === 'garden' || leisure === 'nature_reserve' || leisure === 'playground') return 'park';
  if (shop) return 'shop';
  return 'other';
}

/**
 * Запрашивает ближайшие заведения через Overpass API (OpenStreetMap).
 *
 * Внимание: Overpass принимает координаты в порядке lat,lng — противоположно 2GIS.
 *
 * @param lng  долгота центра (порядок 2GIS)
 * @param lat  широта центра
 * @param radius  радиус поиска в метрах
 * @param limit  максимальное кол-во результатов
 * @param signal  AbortSignal для отмены запроса
 */
export async function fetchNearbyPlaces(
  lng: number,
  lat: number,
  radius: number,
  limit: number,
  signal?: AbortSignal
): Promise<NearbyPlace[]> {
  const outputLimit = Math.min(limit * 5, 100);
  const query = [
    `[out:json][timeout:15];`,
    `(`,
    `node["name"]["amenity"](around:${radius},${lat},${lng});`,
    `node["name"]["shop"](around:${radius},${lat},${lng});`,
    `node["name"]["tourism"](around:${radius},${lat},${lng});`,
    `node["name"]["leisure"](around:${radius},${lat},${lng});`,
    `way["name"]["amenity"](around:${radius},${lat},${lng});`,
    `way["name"]["shop"](around:${radius},${lat},${lng});`,
    `);`,
    `out center ${outputLimit};`,
  ].join('');

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
    signal,
  });

  const data = await res.json();
  if (!data?.elements) return [];

  return (data.elements as OverpassElement[])
    .filter((el) => el.tags?.name)
    .map((el) => {
      const elLat = el.center?.lat ?? el.lat ?? lat;
      const elLon = el.center?.lon ?? el.lon ?? lng;
      const tags = el.tags ?? {};
      return {
        item: {
          id: String(el.id),
          name: tags.name!,
          type: tags.amenity ?? tags.shop ?? tags.tourism ?? tags.leisure ?? '',
          coordinates: [elLon, elLat] as [number, number],
          category: getCategoryFromTags(tags),
          tags,
        } satisfies NearbyPlace,
        dist: haversineDistance(lat, lng, elLat, elLon),
      };
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit)
    .map(({ item }) => item);
}
