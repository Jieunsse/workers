import { NextRequest, NextResponse } from 'next/server';
import { fetchApiServer } from '@/shared/apis/fetchApi.server';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetchApiServer('/user/reset-password', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: '비밀번호 재설정 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
