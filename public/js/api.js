const API = (() => {
  const BASE = '/api';

  const headers = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const request = async (method, endpoint, body) => {
    const res = await fetch(`${BASE}${endpoint}`, {
      method,
      headers: headers(),
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erro || 'Erro na requisição');
    return data;
  };

  return {
    get:    (ep)       => request('GET',    ep),
    post:   (ep, body) => request('POST',   ep, body),
    put:    (ep, body) => request('PUT',    ep, body),
    delete: (ep)       => request('DELETE', ep)
  };
})();
