import { Walk, WalkCluster, Dog } from '@shared/types/walk';

// Моковые данные собак
export const mockDogs: Dog[] = [
  {
    id: '1',
    name: 'Сара',
    breed: 'Пудель',
    avatar: 'https://placehold.co/60x60',
    gender: 'female',
    age: 4,
    weight: 24,
    isVaccinated: true,
    isSterilized: true,
    isTreatedForParasites: true,
    description: 'Боится резких звуков и не любит навязчивость. Идеальна для активных прогулок в компании',
    activityLevel: 'Очень активная',
    compatibility: ['Комфортно с девочками', 'Комфортно с большими собаками'],
    owner: {
      id: 'owner1',
      name: 'Альберт',
      age: 28,
      avatar: 'https://placehold.co/60x60',
    },
  },
  {
    id: '2',
    name: 'Карл',
    breed: 'Джек-рассел-терьер',
    avatar: 'https://placehold.co/60x60',
    gender: 'male',
    age: 12,
    weight: 8,
    isVaccinated: true,
    isSterilized: false,
    isTreatedForParasites: true,
    description: 'Энергичный и дружелюбный, любит играть с другими собаками',
    activityLevel: 'Активный',
    compatibility: ['Комфортно с мальчиками', 'Комфортно с маленькими собаками'],
    owner: {
      id: 'owner2',
      name: 'Мария',
      age: 32,
      avatar: 'https://placehold.co/60x60',
    },
  },
];

// Моковые прогулки для отображения на карте
export const mockWalks: Walk[] = [
  {
    id: '1',
    dogAvatar: 'https://placehold.co/40x40',
    time: new Date(new Date().setHours(17, 30, 0, 0)),
    dogCount: 2,
    status: 'walk',
    coordinates: [37.6017, 55.7311],
    description: 'Собираем компанию для прогулки по парку, присоединяйтесь',
    location: 'Центральная 44',
    distance: 250,
    participants: [mockDogs[0], mockDogs[1]],
  },
  {
    id: '2',
    dogAvatar: 'https://placehold.co/40x40',
    time: new Date(new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setHours(9, 0, 0, 0)),
    dogCount: 3,
    status: 'request-sent',
    coordinates: [37.5433, 55.7102],
    description: 'Утренняя прогулка в парке',
    location: 'Парк Горького',
    distance: 500,
    participants: [mockDogs[0]],
  },
  {
    id: '3',
    dogAvatar: 'https://placehold.co/40x40',
    time: new Date(new Date().setHours(15, 30, 0, 0)),
    dogCount: 1,
    status: 'accepted',
    coordinates: [37.6781, 55.7953],
    description: 'Дневная прогулка',
    location: 'Сокольники',
    distance: 1200,
    participants: [mockDogs[1]],
  },
  {
    id: '4',
    dogAvatar: 'https://placehold.co/40x40',
    time: new Date('2025-06-25T15:40:00'),
    dogCount: 4,
    status: 'rejected',
    coordinates: [37.6269, 55.8304],
  },
  {
    id: '5',
    dogAvatar: 'https://placehold.co/40x40',
    time: new Date(new Date().setHours(17, 0, 0, 0)),
    dogCount: 2,
    status: 'invited',
    coordinates: [37.5817, 55.7558],
  },
  {
    id: '6',
    dogAvatar: 'https://placehold.co/40x40',
    time: new Date(new Date().setHours(19, 15, 0, 0)),
    dogCount: 3,
    status: 'own',
    coordinates: [37.6173, 55.7423],
  },
  {
    id: '7',
    dogAvatar: 'https://placehold.co/40x40',
    time: new Date(new Date().setHours(20, 0, 0, 0)),
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
