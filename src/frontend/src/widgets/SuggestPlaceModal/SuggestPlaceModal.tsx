import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input, Textarea, BottomModal, Tag } from "@shared/ui";
import { Text } from "@shared/ui/Text";
import { PlaceCategory } from "@features/home";
import {
  normalizeAddressSuggestion,
  resolveAddressSuggestion,
  searchAddressSuggestions,
  type GeocodeSuggestion,
} from "@shared/utils";

export interface SuggestPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: SuggestPlaceData) => void;
}

export interface SuggestPlaceData {
  name: string;
  address: string;
  coordinates: [number, number];
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
  const [addressSuggestions, setAddressSuggestions] = useState<
    GeocodeSuggestion[]
  >([]);
  const [selectedCoordinates, setSelectedCoordinates] = useState<
    [number, number] | null
  >(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addressSearchAbortRef = useRef<AbortController | null>(null);
  const addressSearchDebounceRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (addressSearchDebounceRef.current) {
        window.clearTimeout(addressSearchDebounceRef.current);
      }
      addressSearchAbortRef.current?.abort();
    };
  }, []);

  const clearAddressSearch = () => {
    if (addressSearchDebounceRef.current) {
      window.clearTimeout(addressSearchDebounceRef.current);
      addressSearchDebounceRef.current = null;
    }
    addressSearchAbortRef.current?.abort();
    addressSearchAbortRef.current = null;
    setIsLoadingSuggestions(false);
  };

  const requestAddressSuggestions = (query: string) => {
    clearAddressSearch();

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    addressSearchDebounceRef.current = window.setTimeout(async () => {
      const controller = new AbortController();
      addressSearchAbortRef.current = controller;
      setIsLoadingSuggestions(true);

      try {
        const suggestions = await searchAddressSuggestions(
          trimmedQuery,
          controller.signal,
          5,
        );

        if (!controller.signal.aborted) {
          setAddressSuggestions(suggestions);
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
          return;
        }

        setAddressSuggestions([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSuggestions(false);
        }
        if (addressSearchAbortRef.current === controller) {
          addressSearchAbortRef.current = null;
        }
        addressSearchDebounceRef.current = null;
      }
    }, 250);
  };

  const handleAddressInput = (value: string) => {
    setAddress(value);
    setSelectedCoordinates(null);

    if (value.trim()) {
      setAddressError("");
    }

    requestAddressSuggestions(value);
  };

  const handleSuggestionSelect = (suggestion: GeocodeSuggestion) => {
    clearAddressSearch();
    setAddress(suggestion.label);
    setSelectedCoordinates(suggestion.coordinates);
    setAddressSuggestions([]);
    setAddressError("");
  };

  const handleSubmit = async () => {
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

    clearAddressSearch();
    setAddressSuggestions([]);
    setIsSubmitting(true);

    try {
      let resolvedAddress = address.trim();
      let resolvedCoordinates = selectedCoordinates;

      if (!resolvedCoordinates) {
        const firstSuggestion = await resolveAddressSuggestion(resolvedAddress);

        if (!firstSuggestion) {
          setAddressError(t("Wrong address"));
          return;
        }

        resolvedAddress = firstSuggestion.label;
        resolvedCoordinates = firstSuggestion.coordinates;
      } else {
        const normalizedSuggestion = await normalizeAddressSuggestion({
          label: resolvedAddress,
          coordinates: resolvedCoordinates,
        });
        resolvedAddress = normalizedSuggestion.label;
      }

      onSubmit?.({
        name: name.trim(),
        address: resolvedAddress,
        coordinates: resolvedCoordinates,
        category,
        description: description.trim(),
      });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    clearAddressSearch();
    setName("");
    setAddress("");
    setCategory(null);
    setDescription("");
    setNameError("");
    setAddressError("");
    setAddressSuggestions([]);
    setSelectedCoordinates(null);
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
          disabled={!isFilled || isSubmitting}
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
            onInput={handleAddressInput}
          />
          {isLoadingSuggestions && (
            <Text variant="regular-14" color="muted">
              {t("Determining address...")}
            </Text>
          )}
          {addressSuggestions.length > 0 && (
            <div className="w-full max-h-48 overflow-y-auto scrollbar-hide p-1 bg-white rounded-2xl flex flex-col gap-1">
              {addressSuggestions.map((suggestion) => (
                <button
                  key={`${suggestion.label}-${suggestion.coordinates.join(",")}`}
                  type="button"
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full px-4 py-3 rounded-xl text-left bg-zinc-50 active:bg-zinc-100 transition-colors"
                >
                  <Text variant="regular-14" color="primary">
                    {suggestion.label}
                  </Text>
                </button>
              ))}
            </div>
          )}
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
