'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './KebabMenu.module.css';

interface KebabMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function KebabMenu({ onEdit, onDelete }: KebabMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleEdit = () => {
    onEdit();
    setIsOpen(false);
  };

  const handleDelete = () => {
    onDelete();
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={menuRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="메뉴 열기"
        aria-expanded={isOpen}
      >
        <span className={styles.icon}>⋮</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <button type="button" className={styles.menuItem} onClick={handleEdit}>
            수정하기
          </button>
          <button type="button" className={styles.menuItem} onClick={handleDelete}>
            삭제하기
          </button>
        </div>
      )}
    </div>
  );
}
