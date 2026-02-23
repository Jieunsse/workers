'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import ProgressBar from '@/components/progressbar/ProgressBar';
import SettingBig from '@/assets/icons/setting/SettingBig.svg';
import styles from './TodayReport.module.css';

interface TodayReportProps {
  teamName: string;
  totalTasks: number;
  doneTasks: number;
  onDeleteGroup?: () => void;
}

export default function TodayReport({
  teamName,
  totalTasks,
  doneTasks,
  onDeleteGroup,
}: TodayReportProps) {
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleDeleteGroup = () => {
    setIsDropdownOpen(false);
    onDeleteGroup?.();
  };

  return (
    <section className={styles.card}>
      <h1 className={styles.teamName}>{teamName}</h1>

      <div className={styles.content}>
        <div className={styles.row}>
          <div className={styles.leftCol}>
            <span className={styles.progressLabel}>오늘의 진행 상황</span>
            <span className={styles.percent}>{progressPercent}%</span>
          </div>

          <div className={styles.statsGroup}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>오늘의 할 일</span>
              <span className={styles.statValue}>{totalTasks}</span>
            </div>
            <div className={styles.divider} aria-hidden="true" />
            <div className={styles.statItem}>
              <span className={styles.statLabel}>완료 🙌</span>
              <span className={`${styles.statValue} ${styles.statValueDone}`}>{doneTasks}</span>
            </div>
          </div>
        </div>

        <div className={styles.progressRow}>
          <ProgressBar
            done={doneTasks}
            total={totalTasks}
            ariaLabel="오늘의 진행률"
            className={styles.progressBar}
          />
          {onDeleteGroup && (
            <div className={styles.settingsWrapper} ref={dropdownRef}>
              <button
                type="button"
                className={styles.settingsButton}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-label="설정"
                aria-expanded={isDropdownOpen}
              >
                <Image src={SettingBig} alt="설정 버튼" />
              </button>
              {isDropdownOpen && (
                <div className={styles.dropdown}>
                  <button type="button" className={styles.dropdownItem} onClick={handleDeleteGroup}>
                    팀 삭제하기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
