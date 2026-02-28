import React, { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { IonImg } from "@ionic/react";
import {
  Text,
  Input,
  Button,
  Icon,
  TagRadioGroup,
  TagCheckboxGroup,
  Slider,
  Checkbox,
  Textarea,
  BottomModal,
  DatePicker,
} from "@shared/ui";
import {
  getBreeds,
  getGenderOptions,
  getActivityOptions,
  getGenderComfortOptions,
  getSizeComfortOptions,
} from "@features/profile/lib/constants";
import { parseDateParts } from "@shared/utils/date.utils";

interface DogData {
  photos?: string[];
  gender?: string;
  name?: string;
  weight?: number;
  breed?: string;
  birthDate?: string;
  health?: {
    sterilized?: boolean;
    vaccinated?: boolean;
    parasite_treated?: boolean;
  };
  character?: {
    activity?: string;
    comfortable_with?: {
      males?: boolean;
      females?: boolean;
      big_dogs?: boolean;
      small_dogs?: boolean;
      same_size?: boolean;
    };
  };
  comment?: string;
}

interface DogEditFormProps {
  initialData?: DogData;
  onSave?: (data: DogData) => void;
}

const DEFAULT_BIRTH_DATE = "01.09.2023";
const DEFAULT_SELECTED_DATE = {
  day: 1,
  month: 9,
  year: 2023,
};

export const DogEditForm: React.FC<DogEditFormProps> = ({
  initialData,
  onSave,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);
  const [gender, setGender] = useState<string>(initialData?.gender || "female");
  const [name, setName] = useState<string>(initialData?.name || "Клара");
  const [weight, setWeight] = useState<number>(initialData?.weight || 20);
  const [breed, setBreed] = useState<string>(initialData?.breed || t("Mixed"));
  const [birthDate, setBirthDate] = useState<string>(
    initialData?.birthDate || DEFAULT_BIRTH_DATE,
  );
  const [health, setHealth] = useState<{
    sterilized: boolean;
    vaccinated: boolean;
    parasite_treated: boolean;
  }>({
    sterilized: initialData?.health?.sterilized ?? false,
    vaccinated: initialData?.health?.vaccinated ?? true,
    parasite_treated: initialData?.health?.parasite_treated ?? true,
  });
  const [activity, setActivity] = useState<string>(
    initialData?.character?.activity || "medium",
  );
  const [comfortableWith, setComfortableWith] = useState<{
    males: boolean;
    females: boolean;
    big_dogs: boolean;
    small_dogs: boolean;
    same_size: boolean;
  }>({
    males: initialData?.character?.comfortable_with?.males ?? true,
    females: initialData?.character?.comfortable_with?.females ?? false,
    big_dogs: initialData?.character?.comfortable_with?.big_dogs ?? true,
    small_dogs: initialData?.character?.comfortable_with?.small_dogs ?? false,
    same_size: initialData?.character?.comfortable_with?.same_size ?? false,
  });
  const [comment, setComment] = useState<string>(
    initialData?.comment ||
      "Боится резких звуков и не любит навязчивость. Идеальна для активных прогулок в компании",
  );

  const [isBreedDrawerOpen, setIsBreedDrawerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerSyncToken, setDatePickerSyncToken] = useState(0);
  const [searchBreed, setSearchBreed] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    parseDateParts(initialData?.birthDate || DEFAULT_BIRTH_DATE, {
      fallback: DEFAULT_SELECTED_DATE,
    }),
  );

  const parseBirthDate = useCallback((dateString: string) => {
    return parseDateParts(dateString, {
      fallback: DEFAULT_SELECTED_DATE,
    });
  }, []);

  useEffect(() => {
    const nextBirthDate = initialData?.birthDate || DEFAULT_BIRTH_DATE;
    setBirthDate(nextBirthDate);
    setSelectedDate(parseBirthDate(nextBirthDate));
  }, [initialData?.birthDate, parseBirthDate]);

  const handleImageCapture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });

      if (image.dataUrl) {
        setPhotos([...photos, image.dataUrl]);
      }
    } catch {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setPhotos([...photos, result]);
        }
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleDeletePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleBreedSave = () => {
    setIsBreedDrawerOpen(false);
  };

  const handleDateSave = () => {
    const dateString = `${selectedDate.day
      .toString()
      .padStart(2, "0")}.${selectedDate.month.toString().padStart(2, "0")}.${
      selectedDate.year
    }`;
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

  const breeds = getBreeds(t);
  const filteredBreeds = breeds.filter((b) =>
    b.toLowerCase().includes(searchBreed.toLowerCase()),
  );

  const genderOptions = getGenderOptions(t);
  const activityOptions = getActivityOptions(t);
  const genderComfortOptions = getGenderComfortOptions(t);
  const sizeComfortOptions = getSizeComfortOptions(t);

  const handleSave = () => {
    if (onSave) {
      onSave({
        photos,
        gender,
        name,
        weight,
        breed,
        birthDate,
        health,
        character: { activity, comfortable_with: comfortableWith },
        comment,
      });
    }
  };

  return (
    <>
      <div className="self-stretch flex flex-col justify-start items-start gap-8">
        <div className="self-stretch flex flex-col justify-start items-start gap-3.5">
          <Text variant="medium-16" className="self-stretch">
            Фото
          </Text>
          <div className="self-stretch inline-flex justify-start items-start gap-1">
            <div
              className="w-44 h-44 px-5 py-6 bg-white rounded-3xl inline-flex flex-col justify-center items-center gap-5 overflow-hidden cursor-pointer"
              onClick={handleImageCapture}
            >
              <Icon name="camera" size={24} />
            </div>
            {photos.slice(0, 2).map((photo, index) => (
              <div
                key={index}
                className="w-44 h-44 relative rounded-3xl overflow-hidden"
              >
                <IonImg
                  className="w-44 h-44 absolute rounded-3xl object-cover"
                  src={photo}
                  alt={`Dog photo ${index + 1}`}
                />
                <div
                  className="p-2 right-2 top-2 absolute bg-white/60 rounded-full inline-flex flex-col justify-start items-start gap-2.5 overflow-hidden cursor-pointer"
                  onClick={() => handleDeletePhoto(index)}
                >
                  <Icon name="trash" size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="self-stretch flex flex-col justify-start items-center gap-3.5">
          <Text variant="medium-16" className="self-stretch">
            Пол
          </Text>
          <TagRadioGroup
            options={genderOptions}
            value={gender}
            onChange={setGender}
            size="medium"
            className="self-stretch justify-start"
          />
        </div>

        <div className="self-stretch flex flex-col justify-start items-center gap-3.5">
          <Text variant="medium-16" className="self-stretch">
            Имя
          </Text>
          <Input placeholder="Имя собаки" value={name} onInput={setName} />
        </div>

        <div className="self-stretch flex flex-col justify-start items-center gap-3.5">
          <Text variant="semibold-18" className="self-stretch">
            Вес
          </Text>
          <Slider
            min={1}
            max={50}
            value={weight}
            onChange={setWeight}
            unit="кг"
          />
        </div>

        <div className="self-stretch flex flex-col justify-start items-center gap-3.5">
          <Text variant="medium-16" className="self-stretch">
            Порода
          </Text>
          <div
            className="self-stretch h-16 p-5 bg-white rounded-2xl flex flex-col justify-center items-center gap-5 overflow-hidden cursor-pointer"
            onClick={() => setIsBreedDrawerOpen(true)}
          >
            <div className="self-stretch inline-flex justify-between items-center">
              <Text color="primary" className="flex-1">
                {breed}
              </Text>
            </div>
          </div>
        </div>

        <div className="self-stretch flex flex-col justify-start items-center gap-3.5">
          <Text variant="medium-16" className="self-stretch">
            Дата рождения
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

        <div className="self-stretch flex flex-col justify-start items-center gap-3.5">
          <Text variant="medium-16" className="self-stretch">
            Здоровье
          </Text>
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <Checkbox
              label="Стерелизована"
              checked={health.sterilized}
              onChange={(checked) =>
                setHealth({ ...health, sterilized: checked })
              }
            />
            <Checkbox
              label="Вакцинирована"
              checked={health.vaccinated}
              onChange={(checked) =>
                setHealth({ ...health, vaccinated: checked })
              }
            />
            <Checkbox
              label="Обработана от паразитов"
              checked={health.parasite_treated}
              onChange={(checked) =>
                setHealth({ ...health, parasite_treated: checked })
              }
            />
          </div>
        </div>

        <div className="self-stretch flex flex-col justify-start items-center gap-3.5">
          <Text variant="medium-16" className="self-stretch">
            Активность
          </Text>
          <TagRadioGroup
            options={activityOptions}
            value={activity}
            onChange={setActivity}
            size="medium"
            className="self-stretch justify-start"
          />
        </div>

        <div className="self-stretch flex flex-col justify-start items-center gap-3.5">
          <Text variant="medium-16" className="self-stretch">
            С кем комфортно
          </Text>
          <TagCheckboxGroup
            options={genderComfortOptions}
            values={[
              ...(comfortableWith.males ? ["males"] : []),
              ...(comfortableWith.females ? ["females"] : []),
            ]}
            onChange={(values) =>
              setComfortableWith({
                ...comfortableWith,
                males: values.includes("males"),
                females: values.includes("females"),
              })
            }
            size="medium"
            className="self-stretch justify-start"
          />
          <TagCheckboxGroup
            options={sizeComfortOptions}
            values={[
              ...(comfortableWith.big_dogs ? ["big_dogs"] : []),
              ...(comfortableWith.small_dogs ? ["small_dogs"] : []),
              ...(comfortableWith.same_size ? ["same_size"] : []),
            ]}
            onChange={(values) =>
              setComfortableWith({
                ...comfortableWith,
                big_dogs: values.includes("big_dogs"),
                small_dogs: values.includes("small_dogs"),
                same_size: values.includes("same_size"),
              })
            }
            size="medium"
            className="self-stretch justify-start"
          />
        </div>

        <div className="self-stretch flex flex-col justify-start items-center gap-3.5">
          <Text variant="medium-16" className="self-stretch">
            О собаке
          </Text>
          <div className="self-stretch h-28 p-5 bg-white rounded-2xl inline-flex flex-col justify-start items-center gap-5 overflow-hidden">
            <Textarea
              placeholder="Расскажите о собаке"
              value={comment}
              onInput={setComment}
              disableWrapper
              className="self-stretch flex-1"
            />
          </div>
        </div>

        <Button variant="primary" size="L" fullWidth onClick={handleSave}>
          Сохранить
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />

      <BottomModal
        isOpen={isBreedDrawerOpen}
        onClose={() => setIsBreedDrawerOpen(false)}
        title="Порода"
        buttons={
          <div className="self-stretch inline-flex justify-center items-start gap-2.5 w-full">
            <Button
              variant="secondary"
              onClick={() => setIsBreedDrawerOpen(false)}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleBreedSave}
              className="flex-1"
            >
              Сохранить
            </Button>
          </div>
        }
      >
        <Input
          placeholder="Начните вводить породу"
          value={searchBreed}
          onInput={setSearchBreed}
        />
        <TagRadioGroup
          options={filteredBreeds.map((b) => ({ value: b, label: b }))}
          value={breed}
          onChange={setBreed}
          size="medium"
          className="self-stretch justify-start"
        />
      </BottomModal>

      <BottomModal
        isOpen={isDatePickerOpen}
        onClose={closeDatePicker}
        onDidPresent={syncDatePickerPosition}
        title="Дата рождения"
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
