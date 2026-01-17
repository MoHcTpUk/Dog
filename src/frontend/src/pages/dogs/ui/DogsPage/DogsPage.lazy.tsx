import { lazy } from "react";

export const DogsPage = lazy(() =>
  import("./DogsPage").then((module) => ({ default: module.DogsPage }))
);
