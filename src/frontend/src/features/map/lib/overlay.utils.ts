import type { Location as HistoryLocation } from "history";

export interface MapOverlayLocationState {
  background?: HistoryLocation;
}

interface DrawerVisibilityOptions {
  includeOpacity?: boolean;
  includePointerEvents?: boolean;
  hiddenTransform?: string;
  visibleTransform?: string;
}

export const resolveOverlayBasePath = (
  pathname: string,
  state?: MapOverlayLocationState,
) => state?.background?.pathname ?? pathname;

export const isMapOverlayRoute = (
  pathname: string,
  state?: MapOverlayLocationState,
) => resolveOverlayBasePath(pathname, state).startsWith("/map");

export const setOverlayDrawerVisibility = (
  element: HTMLDivElement | null,
  visible: boolean,
  {
    includeOpacity = false,
    includePointerEvents = false,
    hiddenTransform = "translateY(100%)",
    visibleTransform = "translateY(0)",
  }: DrawerVisibilityOptions = {},
) => {
  if (!element) {
    return;
  }

  element.style.transform = visible ? visibleTransform : hiddenTransform;

  if (includeOpacity) {
    element.style.opacity = visible ? "1" : "0";
  }

  if (includePointerEvents) {
    element.style.pointerEvents = visible ? "auto" : "none";
  }
};
