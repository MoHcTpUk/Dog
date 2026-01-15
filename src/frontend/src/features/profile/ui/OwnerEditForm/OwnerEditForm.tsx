import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { IonImg } from '@ionic/react';
import {
  Text,
  Input,
  Button,
  Icon,
  BottomModal,
  DatePicker,
} from '@shared/ui';
import { getMonthNames } from '@shared/lib/constants';

interface OwnerEditFormProps {
  initialData?: any;
  onSave?: (data: any) => void;
}

export const OwnerEditForm: React.FC<OwnerEditFormProps> = ({
  initialData,
  onSave,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<string | null>(
    initialData?.photo || 'https://placehold.co/173x173'
  );
  const [name, setName] = useState<string>(initialData?.name || 'Альберт');
  const [birthDate, setBirthDate] = useState<string>(
    initialData?.birth_date || '3 марта 2009'
  );

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState({
    day: 3,
    month: 3,
    year: 2009,
  });

  const handleImageCapture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });

      if (image.dataUrl) {
        setPhoto(image.dataUrl);
      }
    } catch (error) {
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
          setPhoto(result);
        }
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleDeletePhoto = () => {
    setPhoto(null);
  };

  const handleDateSave = () => {
    const monthNames = getMonthNames(t);
    const dateString = `${selectedDate.day} ${monthNames[selectedDate.month - 1]} ${
      selectedDate.year
    }`;
    setBirthDate(dateString);
    setIsDatePickerOpen(false);
  };

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
              onClick={() => setIsDatePickerOpen(true)}
            >
              <div className="self-stretch inline-flex justify-between items-center">
                <Text color="primary" className="flex-1">
                  {birthDate}
                </Text>
              </div>
            </div>
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
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        title="Дата рождения хозяина"
        buttons={
          <div className="self-stretch inline-flex justify-center items-start gap-2.5 w-full">
            <Button
              variant="secondary"
              onClick={() => setIsDatePickerOpen(false)}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button variant="primary" onClick={handleDateSave} className="flex-1">
              Сохранить
            </Button>
          </div>
        }
      >
        <div className="self-stretch h-72 relative flex flex-col justify-start items-center overflow-hidden">
          <DatePicker value={selectedDate} onChange={setSelectedDate} />
        </div>
      </BottomModal>
    </>
  );
};
