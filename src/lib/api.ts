export const getToken = () => localStorage.getItem('token');
export const setToken = (token: string) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

const nativeFetch = window.fetch;

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Automatically set Content-Type for JSON bodies
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await nativeFetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    removeToken();
    window.location.reload();
  }

  return response;
}
