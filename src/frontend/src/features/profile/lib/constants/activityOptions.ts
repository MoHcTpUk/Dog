import { TagRadioOption } from '@shared/ui';

export const getActivityOptions = (t: (key: string) => string): TagRadioOption[] => [
  { value: 'low', label: t('Low') },
  { value: 'medium', label: t('Medium') },
  { value: 'high', label: t('High') },
];
