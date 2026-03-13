import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { IonImg } from "@ionic/react";
import { platformUtils } from "@shared/hooks";
import { Text, Input, Button, Icon, BottomModal, DatePicker } from "@shared/ui";
import { getMonthNames } from "@shared/lib/constants";
import { parseDateParts } from "@shared/utils/date.utils";

export interface OwnerFormData {
  photo?: string | null;
  name?: string;
  birth_date?: string;
}

interface OwnerEditFormProps {
  initialData?: OwnerFormData;
  onSave?: (data: OwnerFormData) => void;
  isSaving?: boolean;
}

const DEFAULT_SELECTED_DATE = {
  day: 3,
  month: 3,
  year: 2009,
};

export const OwnerEditForm: React.FC<OwnerEditFormProps> = ({
  initialData,
  onSave,
  isSaving = false,
}) => {
  const { t } = useTranslation();
  const monthNames = getMonthNames(t);

  const formatBirthDateLabel = useCallback(
    (value?: string) => {
      const parsed = parseDateParts(value || null, {
        fallback: DEFAULT_SELECTED_DATE,
        monthNames,
      });

      return `${parsed.day} ${monthNames[parsed.month - 1]} ${parsed.year}`;
    },
    [monthNames],
  );

  const [photo, setPhoto] = useState<string | null>(
    initialData?.photo || null,
  );
  const [name, setName] = useState<string>(initialData?.name || "");
  const [birthDate, setBirthDate] = useState<string>(
    initialData?.birth_date ? formatBirthDateLabel(initialData.birth_date) : "",
  );

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerSyncToken, setDatePickerSyncToken] = useState(0);
  const [selectedDate, setSelectedDate] = useState(
    parseDateParts(initialData?.birth_date || null, {
      fallback: DEFAULT_SELECTED_DATE,
      monthNames,
    }),
  );

  const parseBirthDate = useCallback(
    (dateString: string) => {
      return parseDateParts(dateString, {
        fallback: DEFAULT_SELECTED_DATE,
        monthNames,
      });
    },
    [monthNames],
  );

  useEffect(() => {
    const nextBirthDate = initialData?.birth_date
      ? formatBirthDateLabel(initialData.birth_date)
      : "";
    setBirthDate(nextBirthDate);
    setSelectedDate(parseBirthDate(nextBirthDate));
  }, [formatBirthDateLabel, initialData?.birth_date, parseBirthDate]);

  useEffect(() => {
    setPhoto(initialData?.photo || null);
  }, [initialData?.photo]);

  const handleImageCapture = async () => {
    const image = await platformUtils.media.pickImage();
    if (image) {
      setPhoto(image);
    }
  };

  const handleDeletePhoto = () => {
    setPhoto(null);
  };

  const handleDateSave = () => {
    const dateString = `${selectedDate.day} ${
      monthNames[selectedDate.month - 1]
    } ${selectedDate.year}`;
    setBirthDate(dateString);
    setIsDatePickerOpen(false);
  };

  const openDatePicker = () => {
    setSelectedDate(parseBirthDate(birthDate));
    setIsDatePickerOpen(true);
  };

  const closeDatePicker = () => {
    setIsDatePickerOpen(false);
  };

  const syncDatePickerPosition = useCallback(() => {
    setDatePickerSyncToken((current) => current + 1);
  }, []);

  const handleSave = () => {
    if (onSave) {
      onSave({
        photo,
        name,
        birth_date: birthDate,
      });
    }
  };

  return (
    <>
      <div className="self-stretch flex-1 flex flex-col justify-between items-start gap-8">
        <div className="self-stretch flex flex-col justify-start items-start gap-9">
          <div className="self-stretch flex flex-col justify-start items-start gap-3.5">
            <Text variant="medium-16" className="self-stretch">
              Фото хозяина
            </Text>
            <div className="self-stretch inline-flex justify-start items-start gap-1">
              {!photo ? (
                <div
                  className="w-44 h-44 px-5 py-6 bg-white rounded-3xl inline-flex flex-col justify-center items-center gap-5 overflow-hidden cursor-pointer"
                  onClick={handleImageCapture}
                >
                  <Icon name="camera" size={24} />
                </div>
              ) : (
                <div className="w-44 h-44 relative rounded-3xl overflow-hidden">
                  <IonImg
                    className="w-44 h-44 absolute rounded-3xl object-cover"
                    src={photo}
                    alt="Owner photo"
                  />
                  <div
                    className="p-2 right-2 top-2 absolute bg-white/60 rounded-full inline-flex flex-col justify-start items-start gap-2.5 overflow-hidden cursor-pointer"
                    onClick={handleDeletePhoto}
                  >
                    <Icon name="trash" size={16} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="self-stretch flex flex-col justify-start items-center gap-3.5">
            <Text variant="medium-16" className="self-stretch">
              Имя хозяина
            </Text>
            <Input placeholder="Ваше имя" value={name} onInput={setName} />
          </div>

          <div className="self-stretch flex flex-col justify-start items-center gap-3.5">
            <Text variant="medium-16" className="self-stretch">
              Дата рождения хозяина
            </Text>
            <div
              className="self-stretch h-16 p-5 bg-white rounded-2xl flex flex-col justify-center items-center gap-5 overflow-hidden cursor-pointer"
              onClick={openDatePicker}
            >
              <div className="self-stretch inline-flex justify-between items-center">
                <Text color="primary" className="flex-1">
                  {birthDate}
                </Text>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="L"
          fullWidth
          onClick={handleSave}
          loading={isSaving}
          disabled={isSaving}
        >
          Сохранить
        </Button>
      </div>

      <BottomModal
        isOpen={isDatePickerOpen}
        onClose={closeDatePicker}
        onDidPresent={syncDatePickerPosition}
        title="Дата рождения хозяина"
        buttons={
          <div className="self-stretch inline-flex justify-center items-start gap-2.5 w-full">
            <Button
              variant="secondary"
              onClick={closeDatePicker}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleDateSave}
              className="flex-1"
            >
              Сохранить
            </Button>
          </div>
        }
      >
        <div className="self-stretch h-44 relative flex flex-col justify-start items-center overflow-hidden">
          {isDatePickerOpen ? (
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              variant="top"
              syncToken={datePickerSyncToken}
            />
          ) : null}
        </div>
      </BottomModal>
    </>
  );
};
