import React, { useState, useMemo, useEffect, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IonPage, IonContent } from "@ionic/react";
import { Button, Textarea, BottomModal, Icon } from "@shared/ui";
import { Text } from "@shared/ui/Text";
import { TimePicker, TimePickerValue } from "@shared/ui/TimePicker";
import { useMapGL } from "@features/map/context";
import { mockWalks } from "@shared/mocks/walks.mock";
import {
  DEFAULT_WALK_LOCATION_COORDS,
  formatWalkFormDateTime,
  getTimeValueFromWalkDate,
} from "../../lib/walkForm.utils";

interface WalkFormPageProps {
  mode?: "create" | "edit";
}

export const WalkFormPage: React.FC<WalkFormPageProps> = ({
  mode = "create",
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { id } = useParams<{ id?: string }>();
  const { startLocationPicker, userAddedWalks } = useMapGL();

  const [locationAddress, setLocationAddress] = useState("");
  const [locationCoords, setLocationCoords] = useState<[number, number] | null>(null);
  const [description, setDescription] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerSyncToken, setTimePickerSyncToken] = useState(0);

  // Temp time value for modal (only committed on Save)
  const [timeValue, setTimeValue] = useState<TimePickerValue>({
    dayOffset: 0,
    hour: 9,
    minute: 0,
  });
  const [tempTimeValue, setTempTimeValue] = useState<TimePickerValue>(timeValue);

  const availableWalks = useMemo(() => [...userAddedWalks, ...mockWalks], [userAddedWalks]);

  // Load walk data when editing
  const loadedRef = useRef(false);
  useEffect(() => {
    if (mode !== "edit" || !id || loadedRef.current) return;

    const walk = availableWalks.find((w) => w.id === id);
    if (!walk) return;

    loadedRef.current = true;
    setLocationAddress(walk.location || "");
    setLocationCoords(walk.coordinates);
    setDescription(walk.description || "");
    const tv = getTimeValueFromWalkDate(walk.time);
    setTimeValue(tv);
    setTempTimeValue(tv);
  }, [mode, id, availableWalks]);

  const formattedTime = useMemo(
    () => formatWalkFormDateTime(timeValue, t),
    [timeValue, t],
  );

  const handleBack = () => {
    history.goBack();
  };

  const handleLocationTap = () => {
    const coords = locationCoords || DEFAULT_WALK_LOCATION_COORDS;
    startLocationPicker(coords, (newCoords, newAddress) => {
      setLocationCoords(newCoords);
      setLocationAddress(newAddress);
    });
  };

  const handleTimePickerOpen = () => {
    setTempTimeValue(timeValue);
    setTimePickerSyncToken((current) => current + 1);
    setShowTimePicker(true);
  };

  const handleTimePickerSave = () => {
    setTimeValue(tempTimeValue);
    setShowTimePicker(false);
  };

  const handleTimePickerCancel = () => {
    setShowTimePicker(false);
  };

  const handleSave = () => {
    // TODO: dispatch save action / API call
    console.log("Save walk:", { locationAddress, locationCoords, timeValue, description, id });
    history.goBack();
  };

  const title = mode === "edit" ? t("My Walk") : t("New Walk");

  return (
    <IonPage>
      <IonContent className="ion-no-padding">
        <div className="flex flex-col min-h-screen bg-zinc-100">
          {/* Header */}
          <div className="px-3 pt-14 pb-4 flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-3 bg-white rounded-full flex items-center justify-center shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)]"
            >
              <Icon name="arrow-left" size={24} color="#3F335A" />
            </button>
            <Text variant="bold-24" color="primary">
              {title}
            </Text>
          </div>

          {/* Form */}
          <div className="flex-1 px-3 pb-10 flex flex-col gap-3">
            {/* Location — tappable field opens map picker */}
            <div className="flex flex-col gap-2">
              <div className="px-1">
                <Text variant="medium-16" color="muted">
                  {t("Location")}
                </Text>
              </div>
              <div
                className="w-full min-h-[64px] px-5 py-4 bg-white rounded-2xl flex items-center gap-3 cursor-pointer active:bg-zinc-50 transition-colors"
                onClick={handleLocationTap}
              >
                <div className="flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#3F335A"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  {locationAddress ? (
                    <Text variant="regular-16" color="primary" className="truncate block">
                      {locationAddress}
                    </Text>
                  ) : (
                    <Text variant="regular-16" color="muted">
                      {t("Tap to select location")}
                    </Text>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <Icon name="arrow-right" size={20} color="#A0A0A0" />
                </div>
              </div>
            </div>

            {/* Date & Time — tappable field opens time picker modal */}
            <div className="flex flex-col gap-2">
              <div className="px-1">
                <Text variant="medium-16" color="muted">
                  {t("Date and Time")}
                </Text>
              </div>
              <div
                className="w-full h-16 px-5 bg-white rounded-2xl flex items-center justify-between cursor-pointer active:bg-zinc-50 transition-colors"
                onClick={handleTimePickerOpen}
              >
                <Text variant="regular-16" color="primary">
                  {formattedTime}
                </Text>
                <Icon name="time" size={20} color="#A0A0A0" />
              </div>
            </div>

            {/* Comment */}
            <div className="flex flex-col gap-2">
              <div className="px-1">
                <Text variant="medium-16" color="muted">
                  {t("Comment")}
                </Text>
              </div>
              <Textarea
                placeholder={t("Walk comment placeholder")}
                value={description}
                maxLength={200}
                rows={4}
                showCharCount
                onInput={setDescription}
              />
            </div>
          </div>

          {/* Save button */}
          <div className="px-3 pb-10">
            <Button
              variant="primary"
              size="L"
              fullWidth
              onClick={handleSave}
            >
              {t("Save")}
            </Button>
          </div>
        </div>

        {/* Time picker modal */}
        <BottomModal
          isOpen={showTimePicker}
          onClose={handleTimePickerCancel}
          title={t("Date and Time")}
          buttons={
            <div className="flex gap-3 w-full">
              <div className="flex-1">
                <Button
                  variant="secondary-white"
                  size="L"
                  fullWidth
                  onClick={handleTimePickerCancel}
                >
                  {t("Back")}
                </Button>
              </div>
              <div className="flex-1">
                <Button
                  variant="primary"
                  size="L"
                  fullWidth
                  onClick={handleTimePickerSave}
                >
                  {t("Save")}
                </Button>
              </div>
            </div>
          }
        >
          <TimePicker
            value={tempTimeValue}
            onChange={setTempTimeValue}
            syncToken={timePickerSyncToken}
          />
        </BottomModal>
      </IonContent>
    </IonPage>
  );
};
