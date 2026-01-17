export type NotificationType =
  | 'join-request' // [Имя собаки] хочет присоединиться к вашей прогулки
  | 'walk-invite' // [Имя собаки] пригласил(а) вас на прогулку
  | 'invite-accepted' // [Имя собаки] принял(а) ваше приглашение
  | 'invite-rejected' // [Имя собаки] отклонил(а) ваше приглашение
  | 'request-accepted' // [Имя собаки] принял(а) ваш запрос на прогулку
  | 'request-rejected' // [Имя собаки] отклонил(а) ваш запрос на прогулку
  | 'walk-deleted' // [Имя собаки] удалил(а) прогулку
  | 'walk-updated'; // [Имя собаки] изменил(а) прогулку

export interface Notification {
  id: string;
  type: NotificationType;
  dogName: string;
  dogAvatar: string;
  walkId?: string; // undefined для удаленных прогулок
  timestamp: Date;
  isRead: boolean;
}
