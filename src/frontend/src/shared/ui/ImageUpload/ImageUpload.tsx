import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { platformUtils } from "@shared/hooks/usePlatform";
import { Icon } from "../Icon";
import { BottomDrawer } from "../BottomDrawer";
import { Text } from "../Text";

export interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  title?: string | null;
}

interface ImageActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onSetAsMain: () => void;
}

const ImageActionDrawer: React.FC<ImageActionDrawerProps> = ({
  isOpen,
  onClose,
  onDelete,
  onSetAsMain,
}) => {
  const { t } = useTranslation();

  return (
    <BottomDrawer isOpen={isOpen} onClose={onClose}>
      <div
        className="self-stretch py-3.5 inline-flex justify-start items-center gap-5 cursor-pointer"
        onClick={onSetAsMain}
      >
        <Icon name="paw-filled" size={24} />
        <div className="flex-1 justify-start text-gray-700 text-base font-medium font-['Golos_Text']">
          {t("Сделать главным фото профиля")}
        </div>
      </div>
      <div
        className="self-stretch py-3.5 inline-flex justify-start items-center gap-5 cursor-pointer"
        onClick={onDelete}
      >
        <Icon name="trash" size={24} />
        <div className="flex-1 justify-start text-rose-500 text-base font-medium font-['Golos_Text']">
          {t("Удалить фото")}
        </div>
      </div>
    </BottomDrawer>
  );
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  maxImages = 4,
  title,
}) => {
  const { t } = useTranslation();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleImageCapture = async () => {
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      return;
    }

    const selectedImages = await platformUtils.media.pickImages({
      multiple: true,
      maxImages: remainingSlots,
    });

    if (selectedImages.length > 0) {
      onChange([...images, ...selectedImages].slice(0, maxImages));
    }
  };

  const handleImageMenu = (index: number) => {
    setSelectedImageIndex(index);
    setIsDrawerOpen(true);
  };

  const handleDeleteImage = () => {
    if (selectedImageIndex !== null) {
      const newImages = images.filter(
        (_, index) => index !== selectedImageIndex
      );
      onChange(newImages);
    }
    setIsDrawerOpen(false);
    setSelectedImageIndex(null);
  };

  const handleSetAsMain = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      const newImages = [...images];
      const [mainImage] = newImages.splice(selectedImageIndex, 1);
      newImages.unshift(mainImage);
      onChange(newImages);
    }
    setIsDrawerOpen(false);
    setSelectedImageIndex(null);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="InputCover self-stretch inline-flex flex-col justify-start items-start gap-9 w-full">
      {title !== null ? (
        <Text variant="bold-24" tag="h1" className="mb-2 text-start">
          {title ?? t("Upload dog photos")}
        </Text>
      ) : null}

      {images.length === 0 && canAddMore ? (
        <div
          className="UploadPicture w-full h-80 px-5 py-6 bg-white rounded-3xl flex flex-col justify-center items-center gap-5 overflow-hidden cursor-pointer"
          onClick={handleImageCapture}
        >
          <Icon name="camera" size={24} />
        </div>
      ) : (
        <div className="Pictures self-stretch rounded-3xl grid grid-cols-2 gap-2">
          {canAddMore && (
            <div
              className="UploadPicture w-full aspect-square px-5 py-6 bg-white rounded-3xl inline-flex flex-col justify-center items-center gap-5 overflow-hidden cursor-pointer"
              onClick={handleImageCapture}
            >
              <Icon name="camera" size={24} />
            </div>
          )}

          {images.map((image, index) => (
            <div
              key={index}
              className="Picture w-full aspect-square relative rounded-3xl overflow-hidden"
            >
              <img
                className="w-full h-full absolute rounded-3xl object-cover"
                src={image}
                alt={`Dog photo ${index + 1}`}
              />
              <div
                className="BtnRound p-2 right-2 top-2 absolute bg-white/60 rounded-full inline-flex flex-col justify-start items-start gap-2.5 overflow-hidden cursor-pointer"
                onClick={() => handleImageMenu(index)}
              >
                <Icon name="menu-dots" size={16} />
              </div>
            </div>
          ))}
        </div>
      )}
      <ImageActionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onDelete={handleDeleteImage}
        onSetAsMain={handleSetAsMain}
      />
    </div>
  );
};
