import type { CSSProperties } from "react";

export const ONBOARDING_ACTIONS_INSET_CLASS = "px-5 pt-6";

export const ONBOARDING_SHEET_INSET_CLASS = "px-5 pt-10";

export const ONBOARDING_BOTTOM_INSET_STYLE: CSSProperties = {
  paddingBottom: "calc(env(safe-area-inset-bottom) + 56px)",
};
