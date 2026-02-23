import { NextResponse } from 'next/server';

/**
 * GET /api/auth/kakao
 *
 * 카카오 인가 URL을 생성하여 리다이렉트합니다.
 *
 * 왜 서버 라우트 핸들러에서 처리하는가?
 * - REST API 키를 클라이언트 번들에 노출하지 않기 위해서입니다.
 * - NEXT_PUBLIC_ 접두사 없이 서버 전용 환경변수로 관리합니다.
 */
export async function GET() {
  const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  if (!KAKAO_REST_API_KEY) {
    return NextResponse.json(
      { message: 'KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다.' },
      { status: 500 },
    );
  }

  const redirectUri = `${APP_URL}/oauth/kakao`;
  console.log('[kakao] 인가 URL 생성 - redirectUri:', redirectUri);

  const kakaoAuthUrl = new URL('https://kauth.kakao.com/oauth/authorize');
  kakaoAuthUrl.searchParams.set('client_id', KAKAO_REST_API_KEY);
  kakaoAuthUrl.searchParams.set('redirect_uri', redirectUri);
  kakaoAuthUrl.searchParams.set('response_type', 'code');

  return NextResponse.redirect(kakaoAuthUrl.toString());
}
