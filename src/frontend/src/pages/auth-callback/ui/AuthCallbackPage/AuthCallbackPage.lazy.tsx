import { lazy } from "react";

export const AuthCallbackPage = lazy(() =>
  import("./AuthCallbackPage").then((module) => ({ default: module.AuthCallbackPage }))
);


