import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Icon, Input, Tag, Toast, RoundIconButton } from "@shared/ui";
import { Text } from "@shared/ui/Text";
import { useTransientFlag } from "@shared/hooks";
import { CenterModal } from "@shared/ui/CenterModal";
import { useMapGL } from "@features/map/context";
import {
  buildUserAddedPlace,
  filterNearbyPlaces,
  getNearbyPlacesFromLocationState,
  type PlaceSelectLocationState,
  toggleSelectedPlaceId,
} from "../../lib/placeSelect.utils";

export const PlaceSelectPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation<PlaceSelectLocationState>();
  const { placeCreationActive, addUserPlace, cancelPlaceCreation } = useMapGL();

  const nearbyPlaces = useMemo(
    () => getNearbyPlacesFromLocationState(location.state),
    [location.state],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { isVisible: showSelectNotif, show: showSelectNotification } =
    useTransientFlag();

  useEffect(() => {
    if (!placeCreationActive && !showSuccessModal) {
      history.replace("/map");
    }
  }, [placeCreationActive, showSuccessModal, history]);

  const displayedPlaces = useMemo(
    () => filterNearbyPlaces(nearbyPlaces, searchQuery),
    [nearbyPlaces, searchQuery],
  );

  const noSearchResults =
    searchQuery.trim().length > 0 && displayedPlaces.length === 0;

  const handleBack = useCallback(() => {
    history.goBack();
  }, [history]);

  const handleSubmit = useCallback(() => {
    if (!selectedPlaceId) {
      showSelectNotification();
      return;
    }

    const selected = nearbyPlaces.find((place) => place.id === selectedPlaceId);
    if (!selected) return;

    addUserPlace(buildUserAddedPlace(selected, t));
    setShowSuccessModal(true);
  }, [addUserPlace, nearbyPlaces, selectedPlaceId, showSelectNotification, t]);

  const handleSuccessClose = useCallback(() => {
    setShowSuccessModal(false);
    cancelPlaceCreation();
    history.goBack();
  }, [cancelPlaceCreation, history]);

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
              <RoundIconButton
                onClick={handleBack}
                className="w-10 h-10 flex-shrink-0"
              >
                <Icon name="arrow-left" size={24} color="#3F335A" />
              </RoundIconButton>
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
                      onClick={() => setSelectedPlaceId((current) => toggleSelectedPlaceId(current, place.id))}
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
