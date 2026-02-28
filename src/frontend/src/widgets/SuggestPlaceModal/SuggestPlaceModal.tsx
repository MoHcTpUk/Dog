import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input, Textarea, BottomModal, Tag } from "@shared/ui";
import { Text } from "@shared/ui/Text";
import { PlaceCategory } from "@features/home";

export interface SuggestPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: SuggestPlaceData) => void;
}

export interface SuggestPlaceData {
  name: string;
  address: string;
  category: PlaceCategory | null;
  description: string;
}

const CATEGORIES: { value: PlaceCategory; label: string }[] = [
  { value: "cafe", label: "Кофейня" },
  { value: "restaurant", label: "Ресторан" },
  { value: "shop", label: "Магазин" },
  { value: "mall", label: "ТЦ" },
  { value: "park", label: "Парк" },
  { value: "cocktail", label: "Бар" },
];

export const SuggestPlaceModal: React.FC<SuggestPlaceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState<PlaceCategory | null>(null);
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [addressError, setAddressError] = useState("");

  const handleSubmit = () => {
    let hasError = false;

    if (!name.trim()) {
      setNameError(t("Name is required"));
      hasError = true;
    } else {
      setNameError("");
    }

    if (!address.trim()) {
      setAddressError(t("Location is required"));
      hasError = true;
    } else {
      setAddressError("");
    }

    if (hasError) return;

    onSubmit?.({ name: name.trim(), address: address.trim(), category, description: description.trim() });
    handleClose();
  };

  const handleClose = () => {
    setName("");
    setAddress("");
    setCategory(null);
    setDescription("");
    setNameError("");
    setAddressError("");
    onClose();
  };

  const isFilled = name.trim() && address.trim();

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("Suggest a Place")}
      buttons={
        <Button
          variant="primary"
          size="L"
          fullWidth
          disabled={!isFilled}
          onClick={handleSubmit}
        >
          {t("Suggest Place")}
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        {/* Place name */}
        <div className="flex flex-col gap-2">
          <Text variant="medium-16" color="muted">
            {t("Place Name")}
          </Text>
          <Input
            placeholder={t("Enter place name")}
            value={name}
            error={nameError}
            maxLength={80}
            onInput={(val) => {
              setName(val);
              if (val.trim()) setNameError("");
            }}
          />
        </div>

        {/* Address */}
        <div className="flex flex-col gap-2">
          <Text variant="medium-16" color="muted">
            {t("Address")}
          </Text>
          <Input
            placeholder={t("Enter address")}
            value={address}
            error={addressError}
            maxLength={120}
            onInput={(val) => {
              setAddress(val);
              if (val.trim()) setAddressError("");
            }}
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <Text variant="medium-16" color="muted">
            {t("Category")}
          </Text>
          <div className="flex flex-wrap gap-1">
            {CATEGORIES.map((cat) => (
              <Tag
                key={cat.value}
                size="small"
                selected={category === cat.value}
                onClick={() =>
                  setCategory(category === cat.value ? null : cat.value)
                }
                className="flex-shrink-0"
              >
                {cat.label}
              </Tag>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <Text variant="medium-16" color="muted">
            {t("Additional Info")}
          </Text>
          <Textarea
            placeholder={t("Something interesting about this place...")}
            value={description}
            maxLength={300}
            showCharCount
            onInput={setDescription}
          />
        </div>
      </div>
    </BottomModal>
  );
};
