import clsx from 'clsx';
import { InputProps } from './types/types';
import styles from './styles/Input.module.css';

/**
 * 공통 Input 컴포넌트.
 * @param className 추가 CSS 클래스
 * @param props 네이티브 input의 모든 속성(placeholder, type, onChange 등)
 */
export default function Input({ className, ...props }: InputProps) {
  return <input className={clsx(styles.input, className)} {...props} />;
}
