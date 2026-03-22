const API_BASE = '/api';

const getAuthHeader = () => {
  const password = localStorage.getItem('wd_auth');
  return password ? { 'x-auth-password': password } : {};
};

const handleResponse = async (res) => {
  const data = await res.json().catch((err) => {
    console.error('Failed to parse JSON response:', err);
    return {};
  });
  if (!res.ok) {
    const error = new Error(data.error || `Request failed: ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  get: async (path) => {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  post: async (path, body) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(body)
    });
    return handleResponse(res);
  },

  put: async (path, body) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(body)
    });
    return handleResponse(res);
  },

  delete: async (path) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Multipart upload (images)
  upload: async (path, formData) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData
    });
    return handleResponse(res);
  }
};
