import React, { useEffect, useMemo, useRef, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Input, Tag, Toast } from "@shared/ui";
import { Text } from "@shared/ui/Text";
import { CenterModal } from "@shared/ui/CenterModal";
import { useMapGL } from "@features/map/context";
import type { NearbyPlace } from "@shared/api/overpass";

interface PlaceSelectLocationState {
  nearbyPlaces?: NearbyPlace[];
}

const CATEGORY_LABELS: Record<NearbyPlace["category"], string> = {
  cafe: "Кофейня",
  restaurant: "Ресторан",
  shop: "Магазин",
  mall: "Торговый центр",
  park: "Парк",
  other: "Место",
};

const formatAddressFromTags = (place: NearbyPlace) => {
  const street = place.tags["addr:street"];
  const house = place.tags["addr:housenumber"];

  if (street && house) {
    return `${street} ${house}`;
  }

  if (street) {
    return street;
  }

  return place.name;
};

export const PlaceSelectPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation<PlaceSelectLocationState>();
  const { placeCreationActive, addUserPlace, cancelPlaceCreation } = useMapGL();

  const nearbyPlaces = location.state?.nearbyPlaces ?? [];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [showSelectNotif, setShowSelectNotif] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const notifTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!placeCreationActive && !showSuccessModal) {
      history.replace("/map");
    }
  }, [placeCreationActive, showSuccessModal, history]);

  useEffect(() => {
    return () => {
      if (notifTimerRef.current) {
        window.clearTimeout(notifTimerRef.current);
      }
    };
  }, []);

  const displayedPlaces = useMemo(() => {
    if (!searchQuery.trim()) return nearbyPlaces.slice(0, 15);
    const q = searchQuery.toLowerCase().trim();
    return nearbyPlaces.filter((place) => place.name.toLowerCase().includes(q));
  }, [nearbyPlaces, searchQuery]);

  const noSearchResults =
    searchQuery.trim().length > 0 && displayedPlaces.length === 0;

  const handleBack = () => {
    history.goBack();
  };

  const handleSubmit = () => {
    if (!selectedPlaceId) {
      setShowSelectNotif(true);
      if (notifTimerRef.current) window.clearTimeout(notifTimerRef.current);
      notifTimerRef.current = window.setTimeout(() => {
        setShowSelectNotif(false);
        notifTimerRef.current = null;
      }, 3000);
      return;
    }

    const selected = nearbyPlaces.find((place) => place.id === selectedPlaceId);
    if (!selected) return;

    addUserPlace({
      id: selected.id,
      name: selected.name,
      coordinates: selected.coordinates,
      dogFriendly: true,
      category: selected.category,
      categoryLabel: CATEGORY_LABELS[selected.category],
      distance: "Новое место на карте",
      address: formatAddressFromTags(selected),
      workingHours: selected.tags.opening_hours,
      description:
        selected.tags.description ||
        "Место добавлено пользователем и доступно для просмотра на карте",
      isFavorite: false,
    });
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    cancelPlaceCreation();
    history.goBack();
  };

  return (
    <IonPage>
      <IonContent className="ion-no-padding">
        {showSelectNotif && (
          <Toast
            message={t("Select a place to continue")}
            variant="info"
          />
        )}

        <CenterModal isOpen={showSuccessModal} onClose={handleSuccessClose}>
          <div className="p-5 bg-white rounded-2xl flex flex-col gap-10">
            <div className="flex flex-col gap-2.5">
              <Text variant="bold-24" color="primary">
                {t("Place added!")}
              </Text>
              <Text variant="regular-14" color="muted">
                {t(
                  "You made walks with dogs even more convenient – the place will be visible to other users on the map",
                )}
              </Text>
            </div>
            <Button
              variant="secondary-gray"
              size="M"
              fullWidth
              onClick={handleSuccessClose}
            >
              {t("Close")}
            </Button>
          </div>
        </CenterModal>

        <div className="flex flex-col min-h-screen bg-zinc-100">
          <div className="px-3 pt-5 pb-3 flex flex-col gap-8">
            <div className="h-14 flex items-center gap-3.5">
              <button
                onClick={handleBack}
                className="w-10 h-10 bg-white rounded-full shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)] flex items-center justify-center flex-shrink-0"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 18C14 18 8.00001 13.5811 8 12C7.99999 10.4188 14 6 14 6"
                    stroke="#3F335A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <Text variant="bold-24" color="primary">
                {t("Dog-friendly place")}
              </Text>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5 flex flex-col gap-8 min-h-0">
            <Input
              placeholder={t("Start typing the name")}
              value={searchQuery}
              onInput={setSearchQuery}
            />

            <div className="flex-1 min-h-0">
              {noSearchResults ? (
                <Text variant="regular-14" color="muted">
                  {t(
                    "No nearby venue found. Choose from the list or move the pin on the map",
                  )}
                </Text>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {displayedPlaces.map((place) => (
                    <Tag
                      key={place.id}
                      size="medium"
                      selected={selectedPlaceId === place.id}
                      onClick={() =>
                        setSelectedPlaceId(
                          selectedPlaceId === place.id ? null : place.id,
                        )
                      }
                    >
                      {place.name}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-5 pb-10 pt-3">
            <Button variant="primary" size="L" fullWidth onClick={handleSubmit}>
              {t("Submit")}
            </Button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
