import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@shared/ui';

export type ProfileTab = 'dog' | 'owner';

interface ProfileTabSwitcherProps {
  activeTab: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}

export const ProfileTabSwitcher: React.FC<ProfileTabSwitcherProps> = ({
  activeTab,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-[3px] bg-white/60 rounded-full shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)] flex justify-start items-center">
      <div
        className={`px-7 py-3.5 rounded-full flex justify-start items-start gap-2.5 cursor-pointer transition-colors ${
          activeTab === 'dog' ? 'bg-white' : ''
        }`}
        onClick={() => onChange('dog')}
      >
        <Text variant="medium-16" color="primary" className="text-center">
          {t('Dog')}
        </Text>
      </div>
      <div
        className={`px-7 py-3.5 rounded-full flex justify-start items-start gap-11 cursor-pointer transition-colors ${
          activeTab === 'owner' ? 'bg-white' : ''
        }`}
        onClick={() => onChange('owner')}
      >
        <Text variant="medium-16" color="primary" className="text-center">
          {t('Owner')}
        </Text>
      </div>
    </div>
  );
};
