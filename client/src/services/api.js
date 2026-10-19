import axios from 'axios';

import { notify } from '../utils/notifications';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only a request that carried this browser's token can mean an expired
    // session. A rejected sign-in (no Authorization header) keeps its own
    // message such as "Invalid credentials".
    const sentToken = Boolean(error.config?.headers?.Authorization);

    if (error.response?.status === 401 && sentToken && localStorage.getItem('token')) {
      const message = 'Your session expired. Please sign in again.';

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:expired'));

      // Says why the session ended instead of silently dropping the user on the
      // sign-in screen. The bus drops repeats from requests failing together.
      notify.error(message);

      // The raw "Invalid or expired access token" is replaced by the same
      // wording, so a caller reporting the failure shows the same sentence and
      // the bus collapses the pair into one notification.
      if (error.response.data) error.response.data.message = message;
    }
    return Promise.reject(error);
  },
);

export default api;
