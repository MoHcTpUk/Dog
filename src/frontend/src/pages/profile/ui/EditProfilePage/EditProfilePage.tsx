import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MainLayout } from '@app/layouts/MainLayout';
import { Icon, Text } from '@shared/ui';
import { DogEditForm } from '@features/profile/ui/DogEditForm';
import { OwnerEditForm } from '@features/profile/ui/OwnerEditForm';
import { ProfileTabSwitcher, ProfileTab } from '@widgets/ProfileTabSwitcher';

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

interface OwnerData {
  photo?: string | null;
  name?: string;
  birth_date?: string;
}

export const EditProfilePage: React.FC = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState<ProfileTab>('dog');
  const [notificationCount] = useState(2);

  const handleNotificationClick = () => {
    history.push('/notifications');
  };

  const handleBack = () => {
    history.goBack();
  };

  const handleSaveDog = (data: DogData) => {
    console.log('Save dog profile:', data);
    history.goBack();
  };

  const handleSaveOwner = (data: OwnerData) => {
    console.log('Save owner profile:', data);
    history.goBack();
  };

  return (
    <MainLayout>
      <div className="self-stretch px-3 py-5 inline-flex flex-col justify-start items-start gap-8 w-full">
        <div className="self-stretch h-14 inline-flex justify-between items-center">
          <div
            className="p-2 -rotate-90 bg-white rounded-full shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)] inline-flex flex-col justify-center items-center gap-2.5 overflow-hidden cursor-pointer"
            onClick={handleBack}
          >
            <div className="rotate-90">
              <Icon name="arrow-left" size={24} />
            </div>
          </div>

          <ProfileTabSwitcher activeTab={activeTab} onChange={setActiveTab} />

          <div
            className="relative cursor-pointer"
            onClick={handleNotificationClick}
          >
            <div className="p-3 -rotate-90 bg-white rounded-full shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)] flex flex-col justify-center items-center">
              <div className="rotate-90">
                <Icon name="bell" size={24} />
              </div>
            </div>
            {notificationCount > 0 && (
              <div className="absolute min-w-5 px-1.5 py-0.5 left-[29px] top-[-9px] bg-pink-300 rounded-full flex flex-col justify-center items-center">
                <Text variant="medium-14" color="white">
                  {notificationCount}
                </Text>
              </div>
            )}
          </div>
        </div>

        <div className="self-stretch relative">
          <div
            className={`transition-opacity duration-300 ${
              activeTab === 'dog' ? 'opacity-100' : 'opacity-0 pointer-events-none absolute top-0 left-0 right-0'
            }`}
          >
            <DogEditForm onSave={handleSaveDog} />
          </div>
          <div
            className={`transition-opacity duration-300 ${
              activeTab === 'owner' ? 'opacity-100' : 'opacity-0 pointer-events-none absolute top-0 left-0 right-0'
            }`}
          >
            <OwnerEditForm onSave={handleSaveOwner} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
