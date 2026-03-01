import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { IonImg } from "@ionic/react";
import { platformUtils } from "@shared/hooks/usePlatform";
import { Input, BottomModal, DatePicker, Text, Button, Icon } from "@shared/ui";
import { parseDateParts } from "@shared/utils/date.utils";
import { DogProfileData, StepErrors } from "../../model/types";
import { OnboardingStepField, OnboardingStepLayout } from "../StepLayout";

interface OwnerInfoStepProps {
  data: DogProfileData;
  errors: StepErrors;
  onUpdate: (updates: Partial<DogProfileData>) => void;
}

export const OwnerInfoStep: React.FC<OwnerInfoStepProps> = ({
  data,
  errors,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerSyncToken, setDatePickerSyncToken] = useState(0);
  const getInitialDate = useCallback(() => {
    const today = new Date();
    const fallback = {
      day: today.getDate(),
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    };

    return parseDateParts(data.owner.birth_date, {
      fallback,
    });
  }, [data.owner.birth_date]);

  const [selectedDate, setSelectedDate] = useState(getInitialDate());

  useEffect(() => {
    setSelectedDate(getInitialDate());
  }, [getInitialDate]);

  const handleOwnerUpdate = (field: string, value: string) => {
    onUpdate({
      owner: {
        ...data.owner,
        [field]: value,
      },
    });
  };

  const handleImageCapture = async () => {
    const image = await platformUtils.media.pickImage();
    if (image) {
      handleOwnerUpdate("photo", image);
    }
  };

  const handleDeletePhoto = () => {
    handleOwnerUpdate("photo", "");
  };

  const handleDateChange = (date: {
    day: number;
    month: number;
    year: number;
  }) => {
    setSelectedDate(date);
  };

  const handleDateSave = () => {
    const dateString = `${selectedDate.year}-${selectedDate.month
      .toString()
      .padStart(2, "0")}-${selectedDate.day.toString().padStart(2, "0")}`;
    handleOwnerUpdate("birth_date", dateString);
    setIsDatePickerOpen(false);
  };

  const handleDateCancel = () => {
    setIsDatePickerOpen(false);
  };

  const syncDatePickerPosition = useCallback(() => {
    setDatePickerSyncToken((current) => current + 1);
  }, []);

  const openDatePicker = () => {
    setSelectedDate(getInitialDate());
    setIsDatePickerOpen(true);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return t("Birth Date");
    const parsedDate = parseDateParts(dateString, {
      fallback: getInitialDate(),
    });

    return new Intl.DateTimeFormat(undefined).format(
      new Date(parsedDate.year, parsedDate.month - 1, parsedDate.day),
    );
  };

  return (
    <>
      <OnboardingStepLayout title={t("About the owner")}>
        <div className="Content self-stretch flex-1 pb-5 flex flex-col justify-start items-center gap-14 w-full">
          <div className="Container self-stretch flex-1 flex flex-col justify-start items-start gap-8 w-full">
            {/* Photo Upload */}
            <div className="InputCover self-stretch flex flex-col justify-start items-start gap-5 w-[174px]">
              <div className="Pictures self-stretch inline-flex justify-start items-start gap-1">
                {!data.owner.photo ? (
                  <Button
                    variant="secondary"
                    onClick={handleImageCapture}
                    className="UploadPicture w-full aspect-square px-5 py-6 bg-white rounded-3xl inline-flex flex-col justify-center items-center gap-5 overflow-hidden"
                  >
                    <Icon name="camera" size={24} />
                  </Button>
                ) : (
                  <div className="Picture w-full aspect-square relative rounded-3xl overflow-hidden">
                    <IonImg
                      className="w-full h-full absolute rounded-3xl object-cover"
                      src={data.owner.photo}
                      alt="Owner photo"
                    />
                    <Button
                      variant="secondary-white"
                      onClick={handleDeletePhoto}
                      className="p-2 right-2 top-2 absolute bg-white/60 rounded-full inline-flex flex-col justify-start items-start gap-2.5 overflow-hidden"
                    >
                      <Icon name="trash" size={24} />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Name */}
            <OnboardingStepField label={t("Owner name")}>
              <Input
                placeholder={t("Your name")}
                value={data.owner.name}
                error={errors.ownerName}
                onInput={(value) => handleOwnerUpdate("name", value)}
                className="border-0 bg-transparent p-0 h-auto"
              />
            </OnboardingStepField>

            {/* Owner Birth Date */}
            <OnboardingStepField label={t("Owner birth date")}>
              <div
                className="Input self-stretch h-16 p-5 bg-white rounded-2xl flex flex-col justify-center items-center gap-5 overflow-hidden cursor-pointer"
                onClick={openDatePicker}
              >
                <div className="Text self-stretch inline-flex justify-between items-center">
                  <Text color="muted" className="flex-1 text-start">
                    {formatDisplayDate(data.owner.birth_date || "")}
                  </Text>
                  <div className="IconCover flex justify-end items-center gap-2.5" />
                </div>
              </div>
            </OnboardingStepField>
          </div>
        </div>
      </OnboardingStepLayout>

      {/* Date Picker Modal */}
      <BottomModal
        isOpen={isDatePickerOpen}
        onClose={handleDateCancel}
        onDidPresent={syncDatePickerPosition}
        title={t("Owner birth date")}
        className="date-picker-modal"
        buttons={
          <div className="Buttons self-stretch inline-flex justify-center items-start gap-2.5 w-full">
            <Button
              variant="secondary"
              onClick={handleDateCancel}
              className="flex-1"
            >
              {t("Cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleDateSave}
              className="flex-1"
            >
              {t("Save")}
            </Button>
          </div>
        }
      >
        <div className="Carusel self-stretch h-44 relative flex flex-col justify-start items-center overflow-hidden">
          {isDatePickerOpen ? (
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              variant="top"
              syncToken={datePickerSyncToken}
            />
          ) : null}
        </div>
      </BottomModal>
    </>
  );
};
