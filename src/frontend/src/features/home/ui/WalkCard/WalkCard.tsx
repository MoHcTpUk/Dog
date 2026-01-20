import React from "react";
import { Avatar, Icon, Tag } from "@shared/ui";
import { Text } from "@shared/ui/Text";
import { Walk } from "../../model/types";
import { WalkBadge } from "../WalkBadge/WalkBadge";

export interface WalkCardProps {
  walk: Walk;
  onClick?: (walkId: string) => void;
}

export const WalkCard: React.FC<WalkCardProps> = ({ walk, onClick }) => {
  const handleClick = () => {
    onClick?.(walk.id);
  };

  const showBadge = walk.kind && (walk.kind === "request-sent" || walk.kind === "own-with-requests");

  return (
    <div
      onClick={handleClick}
      className="p-5 bg-white rounded-3xl flex flex-col gap-5 cursor-pointer active:opacity-80 transition-opacity w-full"
    >
      <div className="flex justify-start items-center gap-2.5">
        <Avatar
          src={walk.organizerAvatar}
          alt={walk.organizerName}
          size="medium"
          variant="rounded"
        />
        <div className="flex-1 flex flex-col justify-center items-start gap-0.5">
          <Text variant="semibold-18" color="primary">
            {walk.time}
          </Text>
          <Text variant="regular-14" color="muted">
            {walk.distance}
          </Text>
        </div>
        <div className="p-2 -rotate-90 bg-zinc-100 rounded-full flex flex-col justify-center items-center">
          <div className="rotate-90">
            <Icon name="arrow-right" size={24} />
          </div>
        </div>
      </div>

      <Text variant="regular-14" color="primary" className="leading-4">
        {walk.description}
      </Text>

      {walk.joinedDogs.length > 0 && (
        <div className="flex justify-start items-start gap-1">
          {walk.joinedDogs.map((dog) => (
            <Avatar
              key={dog.id}
              src={dog.avatar}
              alt="Dog"
              size="small"
              variant="rounded"
              className="w-10 h-10"
            />
          ))}
        </div>
      )}

      {showBadge ? (
        <WalkBadge kind={walk.kind!} requestCount={walk.requestCount} />
      ) : (
        <Tag variant="outline" size="small" className="self-start">
          {walk.address}
        </Tag>
      )}
    </div>
  );
};
