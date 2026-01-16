import { lazy } from 'react';

export const TermsPageLazy = lazy(() =>
  import('./TermsPage').then((module) => ({
    default: module.TermsPage,
  }))
);
