import type { FocusEvent, KeyboardEvent } from 'react';
import { useId, useMemo, useState } from 'react';

import type { UseDropdownOptions } from '../types/types';
import { getSelectedItem, resolveInitialValue } from '../utils/dropdown';

export default function useDropdown({
  items,
  defaultValue,
  value,
  disabled = false,
  onChange,
}: UseDropdownOptions) {
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [openByKeyboard, setOpenByKeyboard] = useState(false);
  const [shouldRestoreFocus, setShouldRestoreFocus] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    resolveInitialValue(items, defaultValue),
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const currentValue = value ?? uncontrolledValue;
  const selectedItem = getSelectedItem(items, currentValue);
  const selectedIndex = useMemo(
    () => items.findIndex((item) => item.value === currentValue),
    [items, currentValue],
  );
  const fallbackIndex = useMemo(
    () => (selectedIndex >= 0 ? selectedIndex : items.length > 0 ? 0 : -1),
    [items.length, selectedIndex],
  );
  const resolvedActiveIndex = useMemo(() => {
    if (items.length === 0) return -1;
    const base = activeIndex ?? fallbackIndex;
    if (base < 0) return 0;
    return Math.min(base, items.length - 1);
  }, [activeIndex, fallbackIndex, items.length]);

  const handleSelect = (nextValue: string) => {
    if (disabled) return;
    if (value === undefined) {
      setUncontrolledValue(nextValue);
    }
    onChange?.(nextValue);
    setIsOpen(false);
    setActiveIndex(null);
    setShouldRestoreFocus(true);
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setOpenByKeyboard(false);
        setActiveIndex(fallbackIndex);
      } else {
        setActiveIndex(null);
      }
      return next;
    });
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocus = event.relatedTarget as Node | null;
    if (nextFocus && event.currentTarget.contains(nextFocus)) return;
    setIsOpen(false);
    setActiveIndex(null);
    setShouldRestoreFocus(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const target = event.target as HTMLElement | null;
    const isTrigger =
      target instanceof HTMLButtonElement && target.getAttribute('aria-haspopup') === 'listbox';

    if (items.length === 0) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setIsOpen(false);
        setActiveIndex(null);
        setShouldRestoreFocus(true);
      }
      return;
    }

    if (!isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setIsOpen(true);
        setOpenByKeyboard(true);
        setActiveIndex(fallbackIndex);
      }
      return;
    }

    if (isTrigger) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setIsOpen(false);
        setActiveIndex(null);
        setShouldRestoreFocus(true);
      }
      return;
    }

    const maxIndex = items.length - 1;
    setOpenByKeyboard(true);

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const nextIndex = resolvedActiveIndex + 1 > maxIndex ? 0 : resolvedActiveIndex + 1;
        setActiveIndex(nextIndex);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const nextIndex = resolvedActiveIndex <= 0 ? maxIndex : resolvedActiveIndex - 1;
        setActiveIndex(nextIndex);
        break;
      }
      case 'Home': {
        event.preventDefault();
        setActiveIndex(0);
        break;
      }
      case 'End': {
        event.preventDefault();
        setActiveIndex(maxIndex);
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const item = items[resolvedActiveIndex];
        if (item) {
          handleSelect(item.value);
        }
        break;
      }
      case 'Escape': {
        event.stopPropagation();
        setIsOpen(false);
        setActiveIndex(null);
        setShouldRestoreFocus(true);
        break;
      }
      default:
        break;
    }
  };

  return {
    listboxId,
    isOpen,
    selectedItem,
    activeIndex: resolvedActiveIndex,
    openByKeyboard,
    shouldRestoreFocus,
    setActiveIndex,
    clearRestoreFocus: () => setShouldRestoreFocus(false),
    handleSelect,
    handleToggle,
    handleBlur,
    handleKeyDown,
  };
}
