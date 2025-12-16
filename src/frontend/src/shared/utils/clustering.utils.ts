import type { Walk, WalkCluster } from '@shared/types/walk';

/**
 * Простой алгоритм кластеризации на основе расстояния
 * Группирует прогулки, которые находятся близко друг к другу
 *
 * Уровни зума 2GIS (Москва):
 * - 2-8: Страна/регион (очень далеко) - вся Москва в одном экране
 * - 9-12: Город (далеко) - несколько районов
 * - 13-15: Район (средне) - один район
 * - 16-18: Улица (близко) - несколько улиц
 */
export const clusterWalks = (
  walks: Walk[],
  zoom: number,
): (Walk | WalkCluster)[] => {
  // При очень высоком зуме не кластеризуем - пины видны четко
  if (zoom >= 16) {
    return walks;
  }

  // Адаптивный порог в зависимости от зума
  // Группируем когда пины визуально накладываются друг на друга
  let distanceThreshold: number;

  if (zoom <= 8) {
    // Очень далеко - объединяем прогулки в районе
    distanceThreshold = 0.08; // ~8 км
  } else if (zoom <= 10) {
    // Далеко - кластеризуем близкие улицы
    distanceThreshold = 0.03; // ~3 км
  } else if (zoom <= 12) {
    // Средне - кластеризуем соседние улицы
    distanceThreshold = 0.01; // ~1 км
  } else if (zoom <= 14) {
    // Близко - кластеризуем накладывающиеся пины
    distanceThreshold = 0.005; // ~500 м
  } else {
    // Очень близко - кластеризуем только сильно накладывающиеся
    distanceThreshold = 0.002; // ~200 м
  }

  console.log('🔍 Кластеризация:', {
    zoom: zoom.toFixed(2),
    distanceThreshold,
    walkCount: walks.length
  });

  const clusters: WalkCluster[] = [];
  const processedWalks = new Set<string>();
  const singleWalks: Walk[] = [];

  walks.forEach((walk) => {
    if (processedWalks.has(walk.id)) return;

    // Находим все прогулки в радиусе
    const nearbyWalks = walks.filter((otherWalk) => {
      if (processedWalks.has(otherWalk.id) || walk.id === otherWalk.id) {
        return false;
      }

      const distance = getDistance(walk.coordinates, otherWalk.coordinates);
      return distance < distanceThreshold;
    });

    // Если нашли хотя бы одну близкую прогулку - создаем кластер
    if (nearbyWalks.length > 0) {
      const clusterWalks = [walk, ...nearbyWalks];

      // Отмечаем прогулки как обработанные
      clusterWalks.forEach((w) => processedWalks.add(w.id));

      // Вычисляем центр кластера
      const centerLon = clusterWalks.reduce((sum, w) => sum + w.coordinates[0], 0) / clusterWalks.length;
      const centerLat = clusterWalks.reduce((sum, w) => sum + w.coordinates[1], 0) / clusterWalks.length;

      // Собираем уникальные аватарки (максимум 3)
      const avatars = Array.from(
        new Set(clusterWalks.map((w) => w.dogAvatar))
      ).slice(0, 3);

      // Создаем стабильный ID кластера на основе отсортированных ID прогулок
      const sortedWalkIds = clusterWalks.map(w => w.id).sort();
      const clusterId = `cluster-${sortedWalkIds.join('-')}`;

      clusters.push({
        id: clusterId,
        walks: clusterWalks,
        center: [centerLon, centerLat],
        dogAvatars: avatars,
        walkCount: clusterWalks.length,
      });
    } else {
      // Одиночная прогулка - добавляем в массив одиночных
      processedWalks.add(walk.id);
      singleWalks.push(walk);
    }
  });

  // Возвращаем одиночные прогулки + кластеры
  return [...singleWalks, ...clusters];
};

/**
 * Вычисляет расстояние между двумя точками (приближенное)
 */
const getDistance = (
  coord1: [number, number],
  coord2: [number, number]
): number => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  return Math.sqrt(
    Math.pow(lon2 - lon1, 2) + Math.pow(lat2 - lat1, 2)
  );
};

/**
 * Проверяет, является ли объект кластером
 */
export const isCluster = (item: Walk | WalkCluster): item is WalkCluster => {
  return 'walks' in item && Array.isArray((item as WalkCluster).walks);
};

/**
 * Получает уровень зума для кластеризации
 * Возвращает дискретное значение, чтобы избежать частого пересоздания маркеров
 */
export const getClusterZoomLevel = (zoom: number): number => {
  if (zoom >= 16) return 16;
  if (zoom >= 14) return 14;
  if (zoom >= 12) return 12;
  if (zoom >= 10) return 10;
  if (zoom >= 8) return 8;
  return 6;
};
