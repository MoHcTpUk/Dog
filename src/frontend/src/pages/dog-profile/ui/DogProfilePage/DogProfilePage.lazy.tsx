import { lazy } from 'react';

export const DogProfilePage = lazy(() =>
  import('./DogProfilePage').then((module) => ({ default: module.DogProfilePage }))
);
