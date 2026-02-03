import checkedLarge from '@/assets/icons/check/checkedLarge.svg';
import checkedSmall from '@/assets/icons/check/checkedSmall.svg';
import nonCheckedLarge from '@/assets/icons/check/nonCheckedLarge.svg';
import nonCheckedSmall from '@/assets/icons/check/nonCheckedSmall.svg';

export const CHECKBOX_STYLE = {
  icons: {
    checked: {
      large: checkedLarge,
      small: checkedSmall,
    },
    unchecked: {
      large: nonCheckedLarge,
      small: nonCheckedSmall,
    },
  },
  boxSize: {
    large: 18,
    small: 16,
  },
} as const;
