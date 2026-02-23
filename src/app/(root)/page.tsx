/**
 * 랜딩 페이지 — Server Component
 *
 * [왜 Server Component인가?]
 * Next.js에서 metadata(SEO 태그)는 Server Component에서만 export할 수 있다.
 * page.tsx를 Server Component로 유지하면:
 * 1. metadata export → 서버에서 <title>, <meta description> 등 생성 → 크롤러가 읽음
 * 2. 클라이언트 hydration 후 Framer Motion 애니메이션 활성화
 *
 * React SPA(CRA)와의 차이:
 * - React: 서버에서 빈 HTML 생성 → 크롤러가 JS 실행 전 빈 페이지를 봄 → SEO 불리
 * - Next.js App Router: 'use client'여도 서버에서 초기 HTML 생성 → SEO 유리
 *
 * [metadata가 SEO에서 하는 역할]
 * - title: 검색 결과 제목으로 표시
 * - description: 검색 결과 스니펫으로 표시
 * - openGraph: SNS 공유 시 미리보기 카드
 * - robots: 크롤러 색인 여부 제어
 */

import type { Metadata } from 'next';
import LandingPage from './landing/LandingPage';

export const metadata: Metadata = {
  title: 'Coworkers — 함께 만들어가는 업무 관리 서비스',
  description:
    '팀원과 함께 실시간으로 할 일을 추가하고, 칸반보드로 업무 현황을 한눈에 확인하세요. Coworkers로 팀 협업을 더 쉽게.',
  openGraph: {
    title: 'Coworkers — 함께 만들어가는 업무 관리 서비스',
    description:
      '팀원과 함께 실시간으로 할 일을 추가하고, 칸반보드로 업무 현황을 한눈에 확인하세요.',
    type: 'website',
    locale: 'ko_KR',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return <LandingPage />;
}
