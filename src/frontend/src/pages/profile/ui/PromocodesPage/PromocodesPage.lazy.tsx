import { lazy } from 'react';

export const PromocodesPageLazy = lazy(() =>
  import('./PromocodesPage').then((module) => ({
    default: module.PromocodesPage,
  }))
);
