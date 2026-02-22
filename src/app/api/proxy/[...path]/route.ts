import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchApiServer } from '@/shared/apis/fetchApi.server';

// path prefix × method 허용 정책
// images/*는 multipart 복잡도로 인해 별도 전용 라우트에서 처리
// auth/*는 /api/auth/* 전용 라우트가 있으므로 프록시에서 차단
const METHOD_POLICY: Record<string, Set<string>> = {
  user: new Set(['GET', 'PATCH', 'DELETE']),
  groups: new Set(['GET', 'POST', 'PATCH', 'DELETE']),
  tasks: new Set(['GET', 'POST', 'PATCH', 'DELETE']),
  articles: new Set(['GET', 'POST', 'PATCH', 'DELETE']),
  comments: new Set(['GET', 'POST', 'PATCH', 'DELETE']),
  oauthApps: new Set(['POST']),
};

const ALLOWED_PATH_PREFIXES = Object.keys(METHOD_POLICY);

// 액세스 토큰 만료 여부 확인 (JWT payload의 exp 필드 기준)
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// 리프레시 토큰으로 액세스 토큰 재발급
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetchApiServer('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return null;

    const data: { accessToken: string } = await response.json();
    return data.accessToken;
  } catch {
    return null;
  }
}

async function proxyRequest(
  req: NextRequest,
  backendPath: string,
  accessToken: string,
): Promise<Response> {
  const searchParams = req.nextUrl.searchParams.toString();
  const pathWithQuery = searchParams ? `${backendPath}?${searchParams}` : backendPath;

  const method = req.method;
  const isBodyless = method === 'GET' || method === 'HEAD';
  const contentType = req.headers.get('content-type') ?? '';

  const body = isBodyless ? undefined : await req.text();

  return fetchApiServer(pathWithQuery, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(isBodyless ? {} : { 'Content-Type': contentType || 'application/json' }),
    },
    body,
  });
}

async function handleProxy(req: NextRequest, params: { path: string[] }) {
  const method = req.method;
  const pathSegments = params.path;
  const firstSegment = pathSegments[0];

  // 허용된 path prefix인지 확인
  if (!ALLOWED_PATH_PREFIXES.includes(firstSegment)) {
    return NextResponse.json({ message: '허용되지 않는 경로입니다.' }, { status: 403 });
  }

  // 해당 prefix에서 허용된 메서드인지 확인
  if (!METHOD_POLICY[firstSegment].has(method)) {
    return NextResponse.json(
      { message: `${firstSegment} 경로에서 허용되지 않는 메서드입니다.` },
      { status: 405 },
    );
  }

  const backendPath = pathSegments.join('/');
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  // 토큰이 전혀 없으면 401
  if (!accessToken && !refreshToken) {
    return NextResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });
  }

  // 액세스 토큰이 만료됐거나 없으면 리프레시 시도
  if (!accessToken || isTokenExpired(accessToken)) {
    if (!refreshToken) {
      return NextResponse.json({ message: '다시 로그인해주세요.' }, { status: 401 });
    }

    const newAccessToken = await refreshAccessToken(refreshToken);

    if (!newAccessToken) {
      // refresh 실패 시 쿠키 삭제 후 401 — 만료된 쿠키가 남아 무한 refresh 시도하는 것을 방지
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');
      return NextResponse.json(
        { message: '세션이 만료되었습니다. 다시 로그인해주세요.' },
        { status: 401 },
      );
    }

    cookieStore.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });

    accessToken = newAccessToken;
  }

  try {
    const response = await proxyRequest(req, backendPath, accessToken);
    const responseData = await response.text();

    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch {
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(req, await params);
}
