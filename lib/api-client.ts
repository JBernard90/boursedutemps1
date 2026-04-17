export const createTimestamp = () => new Date().toISOString();

// Internal helpers to build query parameters
export const filterBy = (field: string, op: string, value: any) => ({ type: 'where', field, op, value });
export const sortBy = (field: string, dir: string) => ({ type: 'orderBy', field, dir });

const API_BASE = '/api';

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const request = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  
  const contentType = res.headers.get('content-type');
  if (!res.ok) {
    let errorMessage = 'API Error';
    if (contentType && contentType.includes('application/json')) {
      const error = await res.json().catch(() => ({}));
      errorMessage = error.error || errorMessage;
    } else {
      const text = await res.text().catch(() => '');
      errorMessage = text || `Error ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }

  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
};

/**
 * Fetch a single document by its resource path (e.g. "users/123")
 */
export const fetchRecord = async (path: string) => {
  try {
    const data = await request(`/${path}`);
    return { success: true, data: data, id: path.split('/').pop() };
  } catch (e) {
    return { success: false, data: null, id: path.split('/').pop() };
  }
};

/**
 * Fetch a list of records from a collection
 */
export const fetchCollection = async (collection: string, queryObj?: any) => {
  let url = `/${collection}`;
  // In the future, queryObj (where/orderBy) could be appended as query params
  const data = await request(url);
  return {
    items: data.map((d: any) => ({ id: d.id || d.uid, ...d }))
  };
};

/**
 * Create a new record in a collection
 */
export const createRecord = async (collection: string, data: any) => {
  const res = await request(`/${collection}`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return { id: res.id };
};

/**
 * Update an existing record
 */
export const updateRecord = async (path: string, data: any) => {
  await request(`/${path}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

/**
 * Delete a record
 */
export const deleteRecord = async (path: string) => {
  await request(`/${path}`, {
    method: 'DELETE'
  });
};

/**
 * Real-time listener (polling implementation)
 */
export const subscribeToCollection = (collection: string, callback: (data: any) => void, queryParams?: any) => {
  let isCancelled = false;
  
  const fetchSnapshot = async () => {
    if (isCancelled) return;
    try {
      const result = await fetchCollection(collection, queryParams);
      if (!isCancelled) callback(result.items);
    } catch (e) {
      console.error(`[API Sync Error] ${collection}:`, e);
    }
  };

  if (typeof window !== 'undefined') {
    fetchSnapshot();
    const interval = setInterval(fetchSnapshot, 5000); // Polling simulation

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }
  return () => { isCancelled = true; };
};

export const apiAuth = {
  signOut: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },
  getCurrentUser: async () => {
    const token = getToken();
    if (!token) return null;
    try {
      const user = await request('/auth/me');
      return { uid: user.uid, email: user.email, ...user };
    } catch (e) {
      localStorage.removeItem('token');
      return null;
    }
  }
};

export const listenToAuth = (callback: (user: any) => void) => {
  if (typeof window === 'undefined') {
    callback(null);
    return () => {};
  }
  
  const check = () => {
    apiAuth.getCurrentUser().then(callback);
  };

  check();
  return () => {};
};
