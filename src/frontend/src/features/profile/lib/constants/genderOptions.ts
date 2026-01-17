import { TagRadioOption } from '@shared/ui';

export const getGenderOptions = (t: (key: string) => string): TagRadioOption[] => [
  { value: 'male', label: t('Boy') },
  { value: 'female', label: t('Girl') },
];
