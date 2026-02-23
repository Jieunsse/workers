interface RequestErrorContext {
  message: string;
  path: string;
  method: string;
}

function buildProxyUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `/api/proxy${normalizedPath}`;
}

function buildHeaders(options?: RequestInit): HeadersInit {
  const method = (options?.method ?? 'GET').toUpperCase();
  const needsContentType = ['POST', 'PATCH', 'PUT'].includes(method) && options?.body !== undefined;
  return needsContentType ? { 'Content-Type': 'application/json' } : {};
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
  const response = await fetch(buildProxyUrl(path), {
    ...options,
    headers: {
      ...buildHeaders(options),
      ...(options?.headers ?? {}),
    },
  });
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
  const response = await fetch(buildProxyUrl(path), {
    ...options,
    headers: {
      ...buildHeaders(options),
      ...(options?.headers ?? {}),
    },
  });
  assertOk(response, {
    message,
    path,
    method: (options?.method ?? 'GET').toUpperCase(),
  });
}
