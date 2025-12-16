import { Walk, WalkCluster } from '@shared/types/walk';

// Моковые прогулки для отображения на карте
export const mockWalks: Walk[] = [
  {
    id: '1',
    dogAvatar: 'https://placehold.co/40x40',
    time: new Date(new Date().setHours(18, 20, 0, 0)), // Сегодня 18:20
    dogCount: 2,
    status: 'walk',
    coordinates: [37.6017, 55.7311],
  },
  {
    id: '2',
    dogAvatar: 'https://placehold.co/40x40',
    time: new Date(new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setHours(9, 0, 0, 0)), // Завтра 9:00
    dogCount: 3,
    status: 'request-sent',
    coordinates: [37.5433, 55.7102],
  },
  {
    id: '3',
    dogAvatar: 'https://placehold.co/40x40',
    time: new Date(new Date().setHours(15, 30, 0, 0)), // Сегодня 15:30
    dogCount: 1,
    status: 'accepted',
    coordinates: [37.6781, 55.7953],
  },
  {
    id: '4',
    dogAvatar: 'https://placehold.co/40x40',
    time: new Date('2025-06-25T15:40:00'), // 25.06 15:40
    dogCount: 4,
    status: 'rejected',
    coordinates: [37.6269, 55.8304],
  },
  {
    id: '5',
    dogAvatar: 'https://placehold.co/40x40',
    time: new Date(new Date().setHours(17, 0, 0, 0)), // Сегодня 17:00
    dogCount: 2,
    status: 'invited',
    coordinates: [37.5817, 55.7558],
  },
  {
    id: '6',
    dogAvatar: 'https://placehold.co/40x40',
    time: new Date(new Date().setHours(19, 15, 0, 0)), // Сегодня 19:15
    dogCount: 3,
    status: 'own',
    coordinates: [37.6173, 55.7423],
  },
  {
    id: '7',
    dogAvatar: 'https://placehold.co/40x40',
    time: new Date(new Date().setHours(20, 0, 0, 0)), // Сегодня 20:00
    dogCount: 5,
    status: 'own-with-requests',
    coordinates: [37.5889, 55.7339],
  },
];

// Моковый кластер прогулок
export const mockWalkClusters: WalkCluster[] = [
  {
    id: 'cluster-1',
    walks: [mockWalks[0], mockWalks[1], mockWalks[2]],
    dogAvatars: [
      'https://placehold.co/32x32',
      'https://placehold.co/32x32',
      'https://placehold.co/32x32',
    ],
    walkCount: 8,
    center: [37.6000, 55.7300],
  },
];
