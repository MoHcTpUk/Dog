import { lazy } from 'react';

export const NotificationsPageLazy = lazy(() =>
  import('./NotificationsPage').then((module) => ({
    default: module.NotificationsPage,
  }))
);
