import React from 'react';
import { Text } from '../Text';

export interface MenuItemProps {
  title: string;
  onClick?: () => void;
  className?: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  title,
  onClick,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      className={`w-full h-14 px-5 py-3.5 bg-white rounded-2xl flex flex-col justify-center items-center cursor-pointer ${className}`}
    >
      <div className="self-stretch inline-flex justify-start items-center gap-3.5">
        <Text variant="medium-16" color="primary" className="flex-1">
          {title}
        </Text>
      </div>
    </div>
  );
};
