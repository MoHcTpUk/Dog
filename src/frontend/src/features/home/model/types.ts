export type WalkKind = 'regular' | 'own' | 'own-with-requests' | 'request-sent';

export interface Walk {
  id: string;
  organizerName: string;
  organizerAvatar: string;
  time: string;
  distance: string;
  description: string;
  address: string;
  joinedDogs: Array<{
    id: string;
    avatar: string;
  }>;
  kind?: WalkKind;
  requestCount?: number;
}
