import React from "react";
import { Icon } from "@shared/ui";
import { Text } from "@shared/ui/Text";
import { WalkKind } from "../../model/types";

export interface WalkBadgeProps {
  kind: WalkKind;
  requestCount?: number;
}

export const WalkBadge: React.FC<WalkBadgeProps> = ({ kind, requestCount }) => {
  if (kind === "request-sent") {
    return (
      <div className="self-stretch p-3.5 bg-zinc-100 rounded-2xl flex justify-start items-center gap-3">
        <div className="flex-1 flex justify-start items-center gap-2.5">
          <Text variant="medium-16" color="primary">
            Запрос отправлен
          </Text>
        </div>
        <Icon name="time" size={24} />
      </div>
    );
  }

  if (kind === "own-with-requests" && requestCount) {
    return (
      <div className="self-stretch p-3.5 bg-violet-50 rounded-2xl flex justify-start items-center gap-3">
        <div className="flex-1 flex justify-start items-center gap-2.5">
          <Text variant="medium-16" color="primary">
            К вам хотят присоединиться
          </Text>
        </div>
        <div className="min-w-5 px-1.5 py-0.5 bg-gray-700 rounded-full flex flex-col justify-center items-center">
          <Text variant="medium-14" color="white">
            {requestCount}
          </Text>
        </div>
      </div>
    );
  }

  return null;
};
