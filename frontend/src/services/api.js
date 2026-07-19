import axios from 'axios';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use((response) => {
  const data = response.data;
  if (data && data.subioDeNivel) {
    window.dispatchEvent(
      new CustomEvent('subioDeNivel', { detail: { nivel: data.nuevoNivel ?? data.nivel } })
    );
}
  return response;
});

export default api;