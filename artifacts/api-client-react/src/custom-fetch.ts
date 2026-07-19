export const customFetch = async <T,>(url: string, options: RequestInit): Promise<T> => {
  const token = authConfig.getToken?.();
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || errorMsg;
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(errorMsg);
  }

  // Handle empty responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return response.json();
};

const authConfig: { getToken?: () => string | null } = {};

export const setAuthTokenGetter = (getter: () => string | null) => {
  authConfig.getToken = getter;
};

export type ErrorType<T> = T | { error: string };
export type BodyType<T> = T;
