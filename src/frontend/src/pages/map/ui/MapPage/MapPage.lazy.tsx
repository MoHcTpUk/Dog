import { lazy } from "react";

export const MapPage = lazy(() =>
  import("./MapPage").then((module) => ({ default: module.MapPage }))
);
