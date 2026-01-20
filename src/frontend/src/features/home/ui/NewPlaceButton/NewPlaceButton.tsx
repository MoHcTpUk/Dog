import React from "react";
import { Icon } from "@shared/ui";
import { Text } from "@shared/ui/Text";

export const NewPlaceButton: React.FC = () => {
  const handleClick = () => {
    // TODO: implement place suggestion form
    console.log('Suggest new place');
  };

  return (
    <div
      onClick={handleClick}
      className="w-full p-5 bg-pink-300 rounded-3xl flex flex-col justify-end items-center gap-5 cursor-pointer active:opacity-90 transition-opacity"
    >
      <div className="self-stretch flex justify-start items-start gap-5">
        <div className="flex-1 flex flex-col justify-center items-start gap-2.5 max-w-[266px]">
          <Text variant="extra-bold-28" color="white" className="leading-6">
            Предложить место
          </Text>
          <Text variant="medium-16" className="text-gray-700">
            Куда можно с питомцами
          </Text>
        </div>
        <div className="p-2 -rotate-90 bg-white rounded-full flex flex-col justify-start items-start">
          <div className="rotate-90">
            <Icon name="plus" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};
