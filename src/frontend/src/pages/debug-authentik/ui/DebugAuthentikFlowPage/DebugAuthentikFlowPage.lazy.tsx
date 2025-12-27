import { lazy } from "react";

export const DebugAuthentikFlowPage = lazy(() =>
  import("./DebugAuthentikFlowPage").then((module) => ({ default: module.DebugAuthentikFlowPage }))
);


