import React from 'react';
import { Text, Tag } from '@shared/ui';

export interface WalkInfoCardProps {
  time: string;
  description?: string;
  location?: string;
  distance?: number;
  className?: string;
}

export const WalkInfoCard: React.FC<WalkInfoCardProps> = ({
  time,
  description,
  location,
  distance,
  className = '',
}) => {
  return (
    <div className={`p-5 bg-white rounded-3xl flex flex-col gap-5 ${className}`}>
      <div className="flex flex-col gap-1.5">
        <Text variant="extra-bold-28" color="primary">
          {time}
        </Text>
      </div>

      {description && (
        <Text variant="regular-14" color="primary" className="leading-[18px]">
          {description}
        </Text>
      )}

      {(location || distance) && (
        <div className="flex items-start gap-1 flex-wrap">
          {location && (
            <Tag variant="outline" size="small">
              {location}
            </Tag>
          )}
          {distance && (
            <Tag variant="outline" size="small">
              {distance} м
            </Tag>
          )}
        </div>
      )}
    </div>
  );
};
