import type { ReactNode } from 'react';

export type SidebarButtonProps = {
  /** 버튼 좌측 아이콘 (ReactNode로 자유롭게 주입) */
  icon: ReactNode;
  /** 버튼 텍스트 */
  label: string;
  /** 현재 활성(선택) 상태 여부 */
  isActive?: boolean;
  /** true이면 아이콘만 표시하고 라벨 숨김 (사이드바 접힘 시 사용) */
  iconOnly?: boolean;
  /** 클릭 시 호출되는 콜백 */
  onClick?: () => void;
  /** 링크 URL (설정 시 <a> 태그로 렌더링) */
  href?: string;
};
