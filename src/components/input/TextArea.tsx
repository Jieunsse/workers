import clsx from 'clsx';
import { TextAreaProps } from './types/types';
import styles from './styles/TextArea.module.css';

/**
 * 멀티라인 입력 컴포넌트.
 * @param className 추가 CSS 클래스
 * @param props 네이티브 textarea의 모든 속성(placeholder, rows, onChange 등)
 */
export default function TextArea({ className, ref, ...props }: TextAreaProps) {
  return <textarea ref={ref} className={clsx(styles.textarea, className)} {...props} />;
}
