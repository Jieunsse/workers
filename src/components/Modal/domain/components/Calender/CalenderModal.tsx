'use client';

import clsx from 'clsx';
import type { FormEvent, KeyboardEvent } from 'react';
import { useCallback, useId } from 'react';

import BaseButton from '@/components/Button/base/BaseButton';
import DatePickerButton from '@/components/Button/domain/DatePickerButton/DatePickerButton';
import Calendar from '@/components/calendar/Calendar';
import CalendarTime from '@/components/calendar/time/CalendarTime';
import Dropdown from '@/components/dropdown/Dropdown';
import Input from '@/components/input/Input';
import TextArea from '@/components/input/TextArea';
import Modal from '../../../Modal';
import styles from './CalenderModal.module.css';
import {
  DESCRIPTION_ID,
  REPEAT_OPTIONS,
  START_DATE_INPUT_ID,
  START_TIME_INPUT_ID,
  TITLE_ID,
  TODO_MEMO_NAME,
  TODO_TITLE_NAME,
  WEEKDAY_OPTIONS,
} from './constants/CalenderModal.constants';
import { useCalenderModalForm } from './hooks/useCalenderModalForm';
import type { CalenderModalProps } from './types/CalenderModal.types';
import {
  formatDateLabel,
  isPickerToggleKey,
  resolveContentHeightClassNames,
  resolveCalenderModalText,
  resolveCloseOptions,
} from './utils/CalenderModal.utils';
export type { CalenderModalProps } from './types/CalenderModal.types';

/**
 * @param props.isOpen 모달 표시 여부를 boolean으로 전달합니다.
 * @param props.onClose 모달을 닫을 때 실행할 함수를 전달합니다.
 * @param props.onSubmit 할 일 생성 제출 시 실행할 함수를 전달합니다.
 * @param props.text 제목과 라벨, 플레이스홀더 같은 텍스트 옵션을 객체로 전달합니다.
 * @param props.input 입력창에 적용할 옵션을 객체로 전달합니다.
 * @param props.initialValues 초기 입력 값을 객체로 전달합니다.
 * @param props.closeOptions 오버레이 클릭과 Escape 닫힘 옵션을 객체로 전달합니다.
 */
export default function CalenderModal({
  isOpen,
  onClose,
  onSubmit,
  text,
  input,
  initialValues,
  closeOptions,
}: CalenderModalProps) {
  const textOptions = resolveCalenderModalText(text);
  const { closeOnOverlayClick, closeOnEscape } = resolveCloseOptions(closeOptions);
  const todoTitleInputId = useId();
  const todoMemoInputId = useId();

  const {
    todoTitle,
    startDate,
    startTime,
    repeatType,
    repeatDays,
    memo,
    activePicker,
    isWeekdaySelectorVisible,
    setTodoTitle,
    setStartDate,
    setStartTime,
    setMemo,
    handleRepeatTypeChange,
    handleToggleWeekday,
    handleDatePickerToggle,
    handleTimePickerToggle,
    resetForm,
  } = useCalenderModalForm({
    initialValues,
  });

  const handleDateInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (!isPickerToggleKey(event.key)) return;
      event.preventDefault();
      handleDatePickerToggle();
    },
    [handleDatePickerToggle],
  );

  const handleTimeInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (!isPickerToggleKey(event.key)) return;
      event.preventDefault();
      handleTimePickerToggle();
    },
    [handleTimePickerToggle],
  );

  const contentHeightClassNames = resolveContentHeightClassNames(
    activePicker,
    isWeekdaySelectorVisible,
    {
      modalContentDateOpen: styles.modalContentDateOpen,
      modalContentTimeOpen: styles.modalContentTimeOpen,
      modalContentWeekdayOpen: styles.modalContentWeekdayOpen,
    },
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      todoTitle: todoTitle.trim(),
      startDate,
      startTime,
      repeatType,
      repeatDays: isWeekdaySelectorVisible ? repeatDays : [],
      memo: memo.trim(),
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      ariaLabelledby={TITLE_ID}
      ariaDescribedby={DESCRIPTION_ID}
      contentClassName={clsx(styles.modalContent, contentHeightClassNames)}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEscape={closeOnEscape}
    >
      <article className={styles.container}>
        <header className={styles.header}>
          <h2 id={TITLE_ID} className={styles.title}>
            {textOptions.title}
          </h2>
          <p id={DESCRIPTION_ID} className={styles.description}>
            {textOptions.description}
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <section className={styles.fieldGroup}>
            <label htmlFor={todoTitleInputId} className={styles.label}>
              {textOptions.todoTitleLabel}
            </label>
            <Input
              {...input?.todoTitle}
              id={todoTitleInputId}
              className={styles.todoTitleInput}
              type="text"
              name={TODO_TITLE_NAME}
              value={todoTitle}
              placeholder={textOptions.todoTitlePlaceholder}
              onChange={(event) => setTodoTitle(event.target.value)}
            />
          </section>

          <section className={styles.fieldGroup}>
            <p className={styles.label}>{textOptions.startDateTimeLabel}</p>
            <div className={styles.dateTimeInputRow}>
              <Input
                id={START_DATE_INPUT_ID}
                className={clsx(
                  styles.dateInput,
                  activePicker === 'date' && styles.activePickerInput,
                )}
                type="text"
                value={formatDateLabel(startDate)}
                placeholder={textOptions.startDatePlaceholder}
                readOnly
                aria-label={textOptions.startDatePlaceholder}
                onClick={handleDatePickerToggle}
                onKeyDown={handleDateInputKeyDown}
              />
              <Input
                id={START_TIME_INPUT_ID}
                className={clsx(
                  styles.timeInput,
                  activePicker === 'time' && styles.activePickerInput,
                )}
                type="text"
                value={startTime}
                placeholder={textOptions.startTimePlaceholder}
                readOnly
                aria-label={textOptions.startTimePlaceholder}
                onClick={handleTimePickerToggle}
                onKeyDown={handleTimeInputKeyDown}
              />
            </div>

            {activePicker === 'date' ? (
              <div className={styles.calendarPanel}>
                <Calendar value={startDate} onChange={setStartDate} />
              </div>
            ) : null}
            {activePicker === 'time' ? (
              <div className={styles.timePickerPanel}>
                <CalendarTime
                  value={startTime}
                  onChange={setStartTime}
                  outputFormat="ko"
                  stepMinutes={30}
                />
              </div>
            ) : null}
          </section>

          <section className={styles.fieldGroup}>
            <p className={styles.label}>{textOptions.repeatSettingLabel}</p>
            <Dropdown
              items={REPEAT_OPTIONS}
              value={repeatType}
              size="repeat"
              ariaLabel={textOptions.repeatSettingLabel}
              buttonClassName={styles.repeatDropdownButton}
              menuClassName={styles.repeatDropdownMenu}
              onChange={handleRepeatTypeChange}
            />
          </section>

          {isWeekdaySelectorVisible ? (
            <section className={styles.fieldGroup}>
              <p className={styles.label}>{textOptions.repeatWeekdayLabel}</p>
              <div className={styles.weekdayButtonGroup}>
                {WEEKDAY_OPTIONS.map((weekday) => (
                  <DatePickerButton
                    key={weekday.day}
                    day={weekday.day}
                    label={weekday.label}
                    selected={repeatDays.includes(weekday.day)}
                    onClick={handleToggleWeekday}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className={styles.fieldGroup}>
            <label htmlFor={todoMemoInputId} className={styles.label}>
              {textOptions.memoLabel}
            </label>
            <TextArea
              {...input?.memo}
              id={todoMemoInputId}
              className={styles.memoInput}
              name={TODO_MEMO_NAME}
              value={memo}
              placeholder={textOptions.memoPlaceholder}
              onChange={(event) => setMemo(event.target.value)}
            />
          </section>

          <footer className={styles.footer}>
            <BaseButton type="submit" variant="primary" className={styles.submitButton}>
              {textOptions.submitLabel}
            </BaseButton>
          </footer>
        </form>
      </article>
    </Modal>
  );
}
