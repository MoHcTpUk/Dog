import React from "react";
import { Icon, Tag } from "@shared/ui";
import { Text } from "@shared/ui/Text";
import { Place, PlaceCategory } from "../../model/types";
import { IconName } from "@shared/ui/Icon/Icon";

export interface PlaceCardProps {
  place: Place;
  onClick?: (placeId: string) => void;
}

const categoryIconMap: Record<PlaceCategory, IconName> = {
  cafe: 'cafe',
  restaurant: 'restaurant',
  shop: 'shop',
  mall: 'mall',
  park: 'park',
  cocktail: 'cocktail',
};

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onClick }) => {
  const handleClick = () => {
    onClick?.(place.id);
  };

  const hasPhotos = place.photos && place.photos.length > 0;

  return (
    <div
      onClick={handleClick}
      className="p-5 bg-white rounded-3xl flex flex-col gap-5 cursor-pointer active:opacity-80 transition-opacity w-full"
    >
      <div className="flex justify-start items-center gap-2.5">
        <div className="p-1.5 bg-gray-500 rounded-xl flex justify-center items-center">
          <Icon name={categoryIconMap[place.category]} size={18} color="white" />
        </div>
        <div className="flex-1 flex flex-col justify-center items-start gap-0.5">
          <Text variant="semibold-18" color="primary">
            {place.name}
          </Text>
          <Text variant="regular-14" color="muted" className="leading-4">
            {place.distance}
          </Text>
        </div>
        <div className="p-2 -rotate-90 bg-zinc-100 rounded-full flex flex-col justify-center items-center">
          <div className="rotate-90">
            <Icon name="arrow-right" size={24} />
          </div>
        </div>
      </div>

      {hasPhotos && (
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {place.photos!.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`${place.name} ${index + 1}`}
              className="w-48 h-32 rounded-xl object-cover flex-shrink-0"
            />
          ))}
        </div>
      )}

      <Tag variant="outline" size="small" className="self-start">
        {place.address}
      </Tag>
    </div>
  );
};
