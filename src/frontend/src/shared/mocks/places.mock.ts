import { Place, PlaceCategory } from '@features/home';

export const mockPlaces: Place[] = [
  {
    id: 'place-1',
    name: 'Хлебник',
    category: 'cafe',
    categoryLabel: 'Пекарня',
    distance: '170 м от вас',
    address: 'Центральная 51',
    workingHours: '08:00-21:00',
    description: 'Пускают даже с большими собаками, есть уединенные места на веранде',
    isFavorite: false,
  },
  {
    id: 'place-2',
    name: 'CityMall',
    category: 'mall',
    categoryLabel: 'Торговый центр',
    distance: '420 м от вас',
    address: 'Центральная 44',
    workingHours: '10:00-22:00',
    description: 'Просторный ТЦ с зоной для собак на первом этаже',
    photos: [
      'https://placehold.co/240x160/E8E8E8/666666?text=Mall+1',
      'https://placehold.co/240x160/E8E8E8/666666?text=Mall+2',
    ],
    isFavorite: true,
  },
  {
    id: 'place-3',
    name: 'Кофемания',
    category: 'cafe',
    categoryLabel: 'Кофейня',
    distance: '280 м от вас',
    address: 'Пушкина 12',
    workingHours: '09:00-23:00',
    description: 'Уютная кофейня с летней террасой, где рады питомцам',
    photos: [
      'https://placehold.co/240x160/E8E8E8/666666?text=Cafe+1',
      'https://placehold.co/240x160/E8E8E8/666666?text=Cafe+2',
    ],
    isFavorite: false,
  },
  {
    id: 'place-4',
    name: 'Парк Горького',
    category: 'park',
    categoryLabel: 'Парк',
    distance: '850 м от вас',
    address: 'Крымский Вал 9',
    description: 'Большой парк с выделенной зоной для выгула собак',
    photos: [
      'https://placehold.co/240x160/E8E8E8/666666?text=Park+1',
      'https://placehold.co/240x160/E8E8E8/666666?text=Park+2',
    ],
    isFavorite: true,
  },
  {
    id: 'place-5',
    name: 'Бургер&Бар',
    category: 'restaurant',
    categoryLabel: 'Ресторан',
    distance: '350 м от вас',
    address: 'Ленина 88',
    workingHours: '12:00-00:00',
    description: 'Ресторан с открытой верандой, принимают гостей с собаками',
    isFavorite: false,
  },
];

export const placeCategories: { value: PlaceCategory | 'favorites'; label: string; icon?: string }[] = [
  { value: 'favorites', label: 'Мои места', icon: 'star' },
  { value: 'cafe', label: 'Кофейни' },
  { value: 'shop', label: 'Магазины' },
  { value: 'restaurant', label: 'Рестораны' },
  { value: 'mall', label: 'ТЦ' },
  { value: 'park', label: 'Парки' },
];
