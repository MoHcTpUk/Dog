import { TagCheckboxOption } from '@shared/ui';

export const getGenderComfortOptions = (t: (key: string) => string): TagCheckboxOption[] => [
  { value: 'females', label: t('With girls') },
  { value: 'males', label: t('With boys') },
];
