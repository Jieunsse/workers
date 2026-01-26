import checkedLarge from '@/assets/icons/check/checkedLarge.svg';
import checkedSmall from '@/assets/icons/check/checkedSmall.svg';
import nonCheckedLarge from '@/assets/icons/check/nonChekcedLarge.svg';
import nonCheckedSmall from '@/assets/icons/check/nonChekcedSmall.svg';

export const CHECKBOX_ICON = {
  checked: {
    large: checkedLarge,
    small: checkedSmall,
  },
  unchecked: {
    large: nonCheckedLarge,
    small: nonCheckedSmall,
  },
} as const;

export const ICON_SIZE = {
  large: 18,
  small: 16,
} as const;
