import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@shared/ui";
import { Text } from "@shared/ui/Text";
import { SuggestPlaceModal, SuggestPlaceData } from "@widgets/SuggestPlaceModal";

export const NewPlaceButton: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (data: SuggestPlaceData) => {
    // TODO: send to API
    console.log("Suggest place:", data);
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="w-full p-5 bg-pink-300 rounded-3xl flex flex-col justify-end items-center gap-5 cursor-pointer active:opacity-90 transition-opacity"
      >
        <div className="self-stretch flex justify-between items-start gap-5">
          <div className="flex-1 flex flex-col justify-center items-start gap-2.5 max-w-[266px]">
            <Text variant="extra-bold-28" color="white" className="leading-6">
              {t("Suggest a Place")}
            </Text>
            <Text variant="medium-16" className="text-gray-700">
              {t("Dog-friendly places")}
            </Text>
          </div>
          <div className="p-2 -rotate-90 bg-white rounded-full flex flex-col justify-start items-start">
            <div className="rotate-90">
              <Icon name="plus" size={24} />
            </div>
          </div>
        </div>
      </div>

      <SuggestPlaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};
