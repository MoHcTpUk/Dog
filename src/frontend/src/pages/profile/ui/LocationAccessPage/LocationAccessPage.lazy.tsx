import { lazy } from 'react';

export const LocationAccessPage = lazy(() =>
  import('./LocationAccessPage').then((module) => ({
    default: module.LocationAccessPage,
  }))
);
