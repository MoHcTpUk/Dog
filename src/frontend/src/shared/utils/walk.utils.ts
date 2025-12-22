import i18n from '@i18n/config';
import { WalkStatus } from '@shared/types/walk';
import { IconName } from '@shared/ui/Icon';

export interface NotificationConfig {
  icon: IconName;
  bgColor: string;
}

export const getWalkNotificationConfig = (
  status: WalkStatus
): NotificationConfig | null => {
  switch (status) {
    case 'request-sent':
      return {
        icon: 'wait',
        bgColor: 'bg-warning',
      };
    case 'accepted':
      return {
        icon: 'check',
        bgColor: 'bg-success',
      };
    case 'rejected':
      return {
        icon: 'minus',
        bgColor: 'bg-error',
      };
    case 'invited':
      return {
        icon: 'bell',
        bgColor: 'bg-info',
      };
    case 'own':
      return {
        icon: 'user',
        bgColor: 'bg-primary',
      };
    case 'own-with-requests':
      return {
        icon: 'plus',
        bgColor: 'bg-success',
      };
    default:
      return null;
  }
};

export const formatDogCount = (count: number): string => {
  if (count === 1) {
    return i18n.t('dog_one', { count });
  }
  if (count >= 2 && count <= 4) {
    return i18n.t('dog_few', { count });
  }
  return i18n.t('dog_many', { count });
};
