import type { DropdownItemData } from '../types/types';

export function resolveInitialValue(items: DropdownItemData[], defaultValue?: string) {
  if (defaultValue && items.some((item) => item.value === defaultValue)) {
    return defaultValue;
  }
  return items[0]?.value ?? '';
}

export function getSelectedItem(items: DropdownItemData[], currentValue: string) {
  return items.find((item) => item.value === currentValue);
}
