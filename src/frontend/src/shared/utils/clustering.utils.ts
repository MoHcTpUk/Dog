import type { Walk, WalkCluster } from '@shared/types/walk';
import type { PlaceCluster } from '@shared/types/place';

interface ClusterableItem {
  id: string;
  coordinates: [number, number];
}

interface RawCluster<T extends ClusterableItem> {
  id: string;
  items: T[];
  center: [number, number];
}

/**
 * Вычисляет расстояние между двумя точками (приближенное)
 */
const getDistance = (coord1: [number, number], coord2: [number, number]): number => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  return Math.sqrt(Math.pow(lon2 - lon1, 2) + Math.pow(lat2 - lat1, 2));
};

/**
 * Уровни зума 2GIS (Москва):
 * - 2-8: Страна/регион — вся Москва в одном экране
 * - 9-12: Город — несколько районов
 * - 13-15: Район — один район
 * - 16-18: Улица — несколько улиц
 */
const getDistanceThreshold = (zoom: number): number => {
  if (zoom <= 8) return 0.08;
  if (zoom <= 10) return 0.03;
  if (zoom <= 12) return 0.01;
  if (zoom <= 14) return 0.005;
  return 0.002;
};

/**
 * Универсальный алгоритм кластеризации.
 * Возвращает одиночные элементы и сырые кластеры.
 */
const clusterItems = <T extends ClusterableItem>(
  items: T[],
  zoom: number,
): { singles: T[]; clusters: RawCluster<T>[] } => {
  if (zoom >= 16) return { singles: items, clusters: [] };

  const distanceThreshold = getDistanceThreshold(zoom);
  const processed = new Set<string>();
  const singles: T[] = [];
  const clusters: RawCluster<T>[] = [];

  items.forEach((item) => {
    if (processed.has(item.id)) return;

    const nearby = items.filter((other) => {
      if (processed.has(other.id) || item.id === other.id) return false;
      return getDistance(item.coordinates, other.coordinates) < distanceThreshold;
    });

    if (nearby.length > 0) {
      const group = [item, ...nearby];
      group.forEach((i) => processed.add(i.id));

      const centerLon = group.reduce((s, i) => s + i.coordinates[0], 0) / group.length;
      const centerLat = group.reduce((s, i) => s + i.coordinates[1], 0) / group.length;

      const sortedIds = group.map((i) => i.id).sort();
      clusters.push({
        id: `cluster-${sortedIds.join('-')}`,
        items: group,
        center: [centerLon, centerLat],
      });
    } else {
      processed.add(item.id);
      singles.push(item);
    }
  });

  return { singles, clusters };
};

// ─── Прогулки ────────────────────────────────────────────────────────────────

export const clusterWalks = (walks: Walk[], zoom: number): (Walk | WalkCluster)[] => {
  const { singles, clusters } = clusterItems(walks, zoom);

  const walkClusters: WalkCluster[] = clusters.map(({ id, items, center }) => {
    const avatars = Array.from(new Set(items.map((w) => w.dogAvatar))).slice(0, 3);
    return { id, walks: items, center, dogAvatars: avatars, walkCount: items.length };
  });

  return [...singles, ...walkClusters];
};

export const isCluster = (item: Walk | WalkCluster): item is WalkCluster =>
  'walks' in item && Array.isArray((item as WalkCluster).walks);

// ─── Места ───────────────────────────────────────────────────────────────────

export const clusterPlaces = <T extends ClusterableItem>(
  places: T[],
  zoom: number,
): (T | PlaceCluster)[] => {
  const { singles, clusters } = clusterItems(places, zoom);

  const placeClusters: PlaceCluster[] = clusters.map(({ id, items, center }) => ({
    id,
    center,
    placeCount: items.length,
  }));

  return [...singles, ...placeClusters];
};

export const isPlaceCluster = (item: unknown): item is PlaceCluster =>
  typeof item === 'object' &&
  item !== null &&
  'placeCount' in item &&
  !('coordinates' in item);

// ─── Утилиты зума ─────────────────────────────────────────────────────────────

/**
 * Получает дискретный уровень зума для кластеризации,
 * чтобы избежать частого пересоздания маркеров.
 */
export const getClusterZoomLevel = (zoom: number): number => {
  if (zoom >= 16) return 16;
  if (zoom >= 14) return 14;
  if (zoom >= 12) return 12;
  if (zoom >= 10) return 10;
  if (zoom >= 8) return 8;
  return 6;
};
