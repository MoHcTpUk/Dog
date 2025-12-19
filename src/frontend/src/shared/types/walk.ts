export type WalkStatus =
  | 'walk' // Чья-то прогулка (стандартный пин)
  | 'request-sent' // Запрос отправлен
  | 'accepted' // Ваш запрос принят
  | 'rejected' // Запрос отклонен
  | 'invited' // Приглашение на прогулку
  | 'own' // Ваша прогулка
  | 'own-with-requests'; // Ваша прогулка с запросами

export interface Dog {
  id: string;
  name: string;
  breed: string;
  avatar: string;
  gender: 'male' | 'female';
  age: number;
  weight: number;
  isVaccinated?: boolean;
  isSterilized?: boolean;
  isTreatedForParasites?: boolean;
  description?: string;
  activityLevel?: string;
  compatibility?: string[];
  owner: {
    id: string;
    name: string;
    age: number;
    avatar: string;
  };
}

export interface Walk {
  id: string;
  dogAvatar: string;
  time: Date;
  dogCount: number;
  status: WalkStatus;
  coordinates: [number, number];
  description?: string;
  location?: string;
  distance?: number;
  participants?: Dog[];
}

export interface WalkCluster {
  id: string;
  walks: Walk[];
  center: [number, number];
  dogAvatars: string[];
  walkCount: number;
}
