// TODO: 팀원 코드 BFF 마이그레이션 완료 후 주석 해제
// import 'server-only';

import { getBaseUrl, getTeamId } from './config';

const BODYLESS_METHODS = new Set(['GET', 'HEAD']);

// 모듈 최상위에서 환경변수를 읽지 않는다.
// Next.js 빌드의 page data collecting 단계에서 환경변수 주입 전에 실행되면
// "API_BASE_URL is not defined" 에러가 발생하기 때문이다.
// 실제 fetch 호출 시점(런타임)에 환경변수를 읽도록 buildApiUrl을 함수 내부로 이동한다.

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

function normalizePath(path: string) {
  return path.startsWith('/') ? path.slice(1) : path;
}

function buildApiUrl(path: string) {
  const baseUrl = normalizeBaseUrl(getBaseUrl());
  const teamId = getTeamId();
  const relativePath = `${teamId}/${normalizePath(path)}`;
  return new URL(relativePath, baseUrl).toString();
}

function getMethod(options: RequestInit) {
  return (options.method ?? 'GET').toUpperCase();
}

function hasBody(body: RequestInit['body']) {
  return body !== undefined && body !== null;
}

function assertBodyAllowed(method: string, body: RequestInit['body']) {
  if (!hasBody(body)) return;
  if (BODYLESS_METHODS.has(method)) {
    throw new Error(`HTTP ${method} request must not include a body.`);
  }
}

function shouldSetJsonContentType(headers: Headers, body: RequestInit['body']) {
  if (!hasBody(body)) return false;
  if (headers.has('Content-Type')) return false;
  return typeof body === 'string';
}

export function fetchApiServer(path: string, options: RequestInit = {}) {
  const method = getMethod(options);
  assertBodyAllowed(method, options.body);

  const headers = new Headers(options.headers);
  if (shouldSetJsonContentType(headers, options.body)) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(buildApiUrl(path), {
    ...options,
    method,
    headers,
  });
}

// TODO: 팀원 BFF 마이그레이션 완료 후 제거
// groups/http.ts, user/userApi.ts가 fetchApi 이름으로 import 중 — 호환용 alias
export const fetchApi = fetchApiServer;
