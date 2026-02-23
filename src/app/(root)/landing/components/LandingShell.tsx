type LandingShellProps = {
  children: React.ReactNode;
};

/**
 * LandingShell — 랜딩페이지 콘텐츠 래퍼
 *
 * Sidebar와 MobileHeader는 (root)/layout.tsx에서 이미 렌더링되므로
 * LandingShell에서 중복 렌더링하지 않는다.
 */
export default function LandingShell({ children }: LandingShellProps) {
  return <>{children}</>;
}
