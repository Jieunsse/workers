import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchApiServer } from '@/shared/apis/fetchApi.server';

const ACCESS_TOKEN_MAX_AGE = 60 * 60;

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ message: '리프레시 토큰이 없습니다.' }, { status: 401 });
    }

    const response = await fetchApiServer('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data: { accessToken: string } = await response.json();

    // 새 액세스 토큰을 쿠키로 업데이트
    cookieStore.set('accessToken', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    return NextResponse.json({ message: '토큰이 갱신되었습니다.' });
  } catch {
    return NextResponse.json({ message: '토큰 갱신 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
