import { lazy } from 'react';

export const FeedbackPageLazy = lazy(() =>
  import('./FeedbackPage').then((module) => ({
    default: module.FeedbackPage,
  }))
);
