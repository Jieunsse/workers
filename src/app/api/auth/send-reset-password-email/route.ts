import { NextRequest, NextResponse } from 'next/server';
import { fetchApiServer } from '@/shared/apis/fetchApi.server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // redirectUrl을 서버에서 자동 계산
    // 클라이언트가 환경마다 직접 넘길 필요 없이 서버에서 일관되게 처리
    const redirectUrl = new URL(req.url).origin;

    const response = await fetchApiServer('/user/send-reset-password-email', {
      method: 'POST',
      body: JSON.stringify({
        email: body.email,
        redirectUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: '비밀번호 재설정 이메일 발송 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
