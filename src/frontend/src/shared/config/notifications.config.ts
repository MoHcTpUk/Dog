import { NotificationType } from '@shared/types/notification';
import { IconName } from '@shared/ui/Icon';

export interface NotificationConfig {
  textKey: string;
  icon: IconName;
}

export const NOTIFICATION_CONFIG: Record<NotificationType, NotificationConfig> = {
  'join-request': {
    textKey: 'Wants To Join Your Walk',
    icon: 'notification-plus',
  },
  'walk-invite': {
    textKey: 'Invited You To Walk',
    icon: 'notification-plus',
  },
  'invite-accepted': {
    textKey: 'Accepted Your Invitation',
    icon: 'notification-check',
  },
  'invite-rejected': {
    textKey: 'Declined Your Invitation',
    icon: 'notification-minus',
  },
  'request-accepted': {
    textKey: 'Accepted Your Walk Request',
    icon: 'notification-check',
  },
  'request-rejected': {
    textKey: 'Declined Your Walk Request',
    icon: 'notification-minus',
  },
  'walk-deleted': {
    textKey: 'Deleted Walk',
    icon: 'notification-trash',
  },
  'walk-updated': {
    textKey: 'Updated Walk',
    icon: 'notification-edit',
  },
};
