const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

const TOKEN_KEY = 'access_token';

async function request(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) {
    return null;
  }

  const json = await res.json();

  if (!res.ok) {
    let message = 'Request failed';
    if (typeof json?.detail === 'string') {
      message = json.detail;
    } else if (Array.isArray(json?.detail)) {
      message = json.detail.map((d) => d.msg || JSON.stringify(d)).join('; ');
    }
    const err = new Error(message);
    err.status = res.status;
    err.detail = json?.detail;
    throw err;
  }

  return json;
}

// For endpoints that return a raw file (transcript .txt, detections .json)
// rather than JSON we parse — these need the Authorization header attached
// directly to the fetch, so a plain <a href> can't be used (no way to set
// headers on a browser-initiated navigation). Downloads the blob and
// triggers a save via a temporary anchor element.
async function downloadFile(path, filename) {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    throw new Error(`Download failed (${res.status})`);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export const api = {
  get: (path) => request(path),

  post: (path, body) => request(path, {
    method: 'POST',
    body: body === undefined ? undefined : (body instanceof FormData ? body : JSON.stringify(body)),
  }),

  patch: (path, body) => request(path, {
    method: 'PATCH',
    body: body instanceof FormData ? body : JSON.stringify(body),
  }),

  delete: (path) => request(path, { method: 'DELETE' }),

  download: downloadFile,
};

export const TOKEN_STORAGE_KEY = TOKEN_KEY;