function getCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/zc_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export class ApiError extends Error {
  statusCode: number;
  details?: any[];

  constructor(message: string, statusCode: number, details?: any[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});

  // Garante que requisições JSON tenham o cabeçalho adequado
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  // Anexa token CSRF em métodos que alteram estado
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken);
    }
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include', // Envia e recebe cookies HttpOnly de sessão
  });

  // Se resposta for 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = { error: 'Falha ao processar resposta do servidor.' };
  }

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Ocorreu um erro na requisição.',
      response.status,
      data.details
    );
  }

  return data as T;
}
