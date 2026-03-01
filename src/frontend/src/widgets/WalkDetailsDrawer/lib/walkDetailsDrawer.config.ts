import type { IconName } from "@shared/ui/Icon";

export type WalkDetailsVariant =
  | "regular"
  | "request-sent"
  | "joined"
  | "own"
  | "own-with-requests";

export type WalkDetailsModalKey = "leave" | "cancel" | "delete";

interface WalkDetailsActionConfig {
  labelKey: string;
  iconName: IconName;
}

export const WALK_DETAILS_ACTIONS: Record<
  "regular" | "request-sent" | "joined" | "edit",
  WalkDetailsActionConfig
> = {
  regular: {
    labelKey: "Join walk",
    iconName: "plus",
  },
  "request-sent": {
    labelKey: "Request sent",
    iconName: "check",
  },
  joined: {
    labelKey: "Leave walk",
    iconName: "cross",
  },
  edit: {
    labelKey: "Edit walk",
    iconName: "edit",
  },
};

export const WALK_DETAILS_MODAL_CONTENT: Record<
  WalkDetailsModalKey,
  {
    titleKey: string;
    confirmTextKey: string;
  }
> = {
  leave: {
    titleKey: "Leave walk?",
    confirmTextKey: "Yes, leave",
  },
  cancel: {
    titleKey: "Cancel request?",
    confirmTextKey: "Yes, cancel",
  },
  delete: {
    titleKey: "Delete walk?",
    confirmTextKey: "Yes, delete",
  },
};

export const isOwnWalkVariant = (variant: WalkDetailsVariant) =>
  variant === "own" || variant === "own-with-requests";
