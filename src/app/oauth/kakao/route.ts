import { NextRequest, NextResponse } from 'next/server';
import { fetchApiServer } from '@/shared/apis/fetchApi.server';
import { setAuthCookies } from '@/app/api/auth/_lib/cookies';

interface KakaoSignInResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    nickname: string;
    image: string | null;
    teamId: string;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * GET /oauth/kakao
 *
 * 카카오가 인가코드를 전달하는 Redirect URI 페이지 핸들러입니다.
 * Swagger 예시 기준 redirectUri: http://localhost:3000/oauth/kakao
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const redirectUri = `${APP_URL}/oauth/kakao`;

  try {
    console.log('[oauth/kakao] code:', code);
    console.log('[oauth/kakao] redirectUri:', redirectUri);

    const response = await fetchApiServer('/auth/signIn/KAKAO', {
      method: 'POST',
      body: JSON.stringify({ token: code, redirectUri }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error('[oauth/kakao] 백엔드 응답 실패:', response.status, errorBody);
      return NextResponse.redirect(new URL('/login?error=kakao_failed', req.url));
    }

    const data: KakaoSignInResponse = await response.json();
    await setAuthCookies(data.accessToken, data.refreshToken);

    const redirectPath = data.user?.teamId ? `/${data.user.teamId}` : '/addteam';
    return NextResponse.redirect(new URL(redirectPath, req.url));
  } catch (e) {
    console.error('[oauth/kakao] 예외 발생:', e);
    return NextResponse.redirect(new URL('/login?error=kakao_failed', req.url));
  }
}
