const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

async function request(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // CRITICAL FIX: Do not set Content-Type to application/json for FormData (file uploads).
  // The browser will automatically set 'multipart/form-data' with the correct boundary token.
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Handle 204 No Content gracefully (e.g. for DELETE requests)
  if (res.status === 204) {
    return null;
  }

  const json = await res.json();

  if (!res.ok || json.success === false) {
    const err = new Error(json?.error?.message || 'Request failed');
    err.code = json?.error?.code;
    err.status = res.status;
    throw err;
  }

  return json.data;
}

export const api = {
  get: (path) => request(path),
  
  post: (path, body) => request(path, { 
    method: 'POST', 
    // Pass FormData directly, stringify standard JSON objects
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  
  patch: (path, body) => request(path, { 
    method: 'PATCH', 
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  
  delete: (path) => request(path, { method: 'DELETE' }),
};