'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

import styles from './styles/Sidebar.module.css';
import logoLarge from '@/assets/logos/logoLarge.svg';
import logoIcon from '@/assets/logos/logoIcon.svg';
import foldLeftLarge from '@/assets/icons/fold/foldLeftLarge.svg';
import foldRightLarge from '@/assets/icons/fold/foldRightLarge.svg';

type SidebarProps = {
  teamSelect?: ReactNode | ((isCollapsed: boolean) => ReactNode);
  addButton?: ReactNode | ((isCollapsed: boolean) => ReactNode);
  children?: ReactNode | ((isCollapsed: boolean) => ReactNode);
  footer?: ReactNode | ((isCollapsed: boolean) => ReactNode);
  profileImage?: ReactNode;
  profileName?: string;
  profileTeam?: string;
};

/**
 * 데스크탑 사이드바 레이아웃 컨테이너.
 * 접기/펼치기를 지원하며, teamSelect·children·addButton·footer 슬롯으로 구성됩니다.
 * 각 슬롯에 함수를 전달하면 `(isCollapsed: boolean) => ReactNode` 형태로 접힘 상태를 받을 수 있습니다.
 */
export default function Sidebar({
  teamSelect,
  addButton,
  children,
  footer,
  profileImage,
  profileName,
  profileTeam,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      className={clsx(styles.sidebar, isCollapsed && styles.collapsed)}
      animate={{ width: isCollapsed ? 72 : 270 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className={styles.header}>
        <div className={styles.logo}>
          <AnimatePresence mode="wait">
            {isCollapsed ? (
              <motion.div
                key="icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Image src={logoIcon} alt="COWORKERS" width={24} height={24} />
              </motion.div>
            ) : (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Image src={logoLarge} alt="COWORKERS" width={158} height={32} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          type="button"
          className={styles.foldButton}
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? '사이드바 열기' : '사이드바 닫기'}
        >
          <Image src={isCollapsed ? foldRightLarge : foldLeftLarge} alt="" width={28} height={28} />
        </button>
      </div>
      <div className={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={isCollapsed ? 'collapsed' : 'expanded'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {teamSelect &&
              (typeof teamSelect === 'function' ? teamSelect(isCollapsed) : teamSelect)}
            {typeof children === 'function' ? children(isCollapsed) : children}
            {addButton && (typeof addButton === 'function' ? addButton(isCollapsed) : addButton)}
          </motion.div>
        </AnimatePresence>
      </div>
      {footer ? (
        <div className={styles.footer}>
          {typeof footer === 'function' ? footer(isCollapsed) : footer}
        </div>
      ) : profileImage ? (
        <div className={styles.footer}>
          <div className={styles.profileImage}>{profileImage}</div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                className={styles.profileInfo}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <span className={styles.profileName}>{profileName}</span>
                <span className={styles.profileTeam}>{profileTeam}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : null}
    </motion.aside>
  );
}
