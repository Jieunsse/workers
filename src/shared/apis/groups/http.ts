import { fetchApi } from '../fetchApi.server';

interface RequestErrorContext {
  message: string;
  path: string;
  method: string;
}

function assertOk(response: Response, context: RequestErrorContext) {
  if (!response.ok) {
    throw new Error(
      `${context.message} (${context.method} ${context.path}, status: ${response.status})`,
    );
  }
}

function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

export async function requestJson<T>(
  path: string,
  message: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetchApi(path, options);
  assertOk(response, {
    message,
    path,
    method: (options?.method ?? 'GET').toUpperCase(),
  });
  return parseJson<T>(response);
}

export async function requestVoid(
  path: string,
  message: string,
  options?: RequestInit,
): Promise<void> {
  const response = await fetchApi(path, options);
  assertOk(response, {
    message,
    path,
    method: (options?.method ?? 'GET').toUpperCase(),
  });
}
