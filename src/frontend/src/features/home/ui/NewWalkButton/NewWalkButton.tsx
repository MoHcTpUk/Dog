import React from "react";
import { useHistory } from "react-router-dom";
import { Icon } from "@shared/ui";
import { Text } from "@shared/ui/Text";

export const NewWalkButton: React.FC = () => {
  const history = useHistory();

  const handleClick = () => {
    history.push("/map?createWalk=1");
  };

  return (
    <div
      onClick={handleClick}
      className="w-full p-5 bg-pink-300 rounded-3xl flex flex-col justify-end items-center gap-5 cursor-pointer active:opacity-90 transition-opacity"
    >
      <div className="self-stretch flex justify-between items-start gap-5">
        <div className="flex-1 flex flex-col justify-center items-start gap-2.5 max-w-[266px]">
          <Text variant="extra-bold-28" color="white" className="leading-6">
            Новая прогулка
          </Text>
          <Text variant="medium-16" color="primary">
            Собаки рядом смогут присоединиться
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
