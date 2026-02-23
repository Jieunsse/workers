import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchApiServer } from '@/shared/apis/fetchApi.server';

// 멀티파트 복잡도로 인해 일반 프록시에서 처리하지 않고 전용 라우트로 분리
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });
    }

    const formData = await req.formData();

    const response = await fetchApiServer('/images/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: '이미지 업로드 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
