import { NextRequest, NextResponse } from 'next/server';
import { fetchApiServer } from '@/shared/apis/fetchApi.server';
import { setAuthCookies } from '../_lib/cookies';

interface SignInResponseBody {
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetchApiServer('/auth/signIn', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data: SignInResponseBody = await response.json();

    await setAuthCookies(data.accessToken, data.refreshToken);

    // 토큰은 쿠키로 셋팅했으므로 클라이언트에 내려주지 않음
    return NextResponse.json({ user: data.user });
  } catch {
    return NextResponse.json({ message: '로그인 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
