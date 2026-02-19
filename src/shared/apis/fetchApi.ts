import { BASE_URL, TEAM_ID } from './config';

const BODYLESS_METHODS = new Set(['GET', 'HEAD']);
const NORMALIZED_BASE_URL = normalizeBaseUrl(BASE_URL);
const DEV_ACCESS_TOKEN = process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN;
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

function normalizePath(path: string) {
  return path.startsWith('/') ? path.slice(1) : path;
}

function buildApiUrl(path: string) {
  const relativePath = `${TEAM_ID}/${normalizePath(path)}`;
  return new URL(relativePath, NORMALIZED_BASE_URL).toString();
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

function shouldAttachDevAuthHeader(headers: Headers) {
  if (!DEV_ACCESS_TOKEN) return false;
  if (headers.has('Authorization')) return false;
  return IS_DEVELOPMENT;
}

export function fetchApi(path: string, options: RequestInit = {}) {
  const method = getMethod(options);
  assertBodyAllowed(method, options.body);

  const headers = new Headers(options.headers);
  if (shouldSetJsonContentType(headers, options.body)) {
    headers.set('Content-Type', 'application/json');
  }
  if (shouldAttachDevAuthHeader(headers)) {
    headers.set('Authorization', `Bearer ${DEV_ACCESS_TOKEN}`);
  }

  return fetch(buildApiUrl(path), {
    ...options,
    method,
    headers,
  });
}
