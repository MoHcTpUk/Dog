import { TagCheckboxOption } from '@shared/ui';

export const getSizeComfortOptions = (t: (key: string) => string): TagCheckboxOption[] => [
  { value: 'same_size', label: t('With same size dogs') },
  { value: 'small_dogs', label: t('With small dogs') },
  { value: 'big_dogs', label: t('With large dogs') },
];
