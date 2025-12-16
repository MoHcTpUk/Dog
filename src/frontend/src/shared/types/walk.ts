export type WalkStatus =
  | 'walk' // Чья-то прогулка (стандартный пин)
  | 'request-sent' // Запрос отправлен
  | 'accepted' // Ваш запрос принят
  | 'rejected' // Запрос отклонен
  | 'invited' // Приглашение на прогулку
  | 'own' // Ваша прогулка
  | 'own-with-requests'; // Ваша прогулка с запросами

export interface Walk {
  id: string;
  dogAvatar: string;
  time: Date;
  dogCount: number;
  status: WalkStatus;
  coordinates: [number, number];
}

export interface WalkCluster {
  id: string;
  walks: Walk[];
  center: [number, number];
  dogAvatars: string[];
  walkCount: number;
}
