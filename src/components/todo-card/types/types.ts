export type TodoItem = {
  /** 항목 고유 ID */
  id: string;
  /** 항목 텍스트 */
  text: string;
  /** 체크 여부 */
  checked: boolean;
};

export type TodoCardProps = {
  /** 카드 제목 */
  title: string;
  /** 체크박스 항목 목록 */
  items: TodoItem[];
  /** 항목 체크 상태 변경 시 호출되는 콜백 */
  onItemCheckedChange?: (id: string, checked: boolean) => void;
  /** 케밥(⋮) 버튼 클릭 시 호출되는 콜백 */
  onKebabClick?: () => void;
  /** 체크리스트 펼침 여부 (기본값: true) */
  expanded?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
};
