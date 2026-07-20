const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') ? 'https://las-rocas-backend.onrender.com/api/v1' : '/api/v1');

export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number, code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data: { status: string; data?: T; message?: string; code?: string };
  try {
    data = await response.json();
  } catch {
    throw new ApiError('Error inesperado del servidor', 500, 'PARSE_ERROR');
  }

  if (!response.ok) {
    const message = data?.message || 'Error en la solicitud';
    const code = data?.code || 'UNKNOWN_ERROR';
    throw new ApiError(message, response.status, code);
  }

  return data.data as T;
}

async function uploadImage(file: File): Promise<{ url: string }> {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new ApiError('Error al subir la imagen', 500, 'PARSE_ERROR');
  }
  if (!response.ok) {
    throw new ApiError(data?.message || 'Error al subir la imagen', response.status, data?.code || 'UPLOAD_ERROR');
  }
  return data.data;
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: any) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: any) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
  upload: uploadImage,
};
