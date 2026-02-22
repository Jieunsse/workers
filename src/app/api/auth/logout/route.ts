import { NextResponse } from 'next/server';
import { clearAuthCookies } from '../_lib/cookies';

export async function POST() {
  try {
    await clearAuthCookies();
    return NextResponse.json({ message: '로그아웃 되었습니다.' });
  } catch {
    return NextResponse.json({ message: '로그아웃 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
