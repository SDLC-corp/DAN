import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

const axiosApi = axios.create({
  baseURL,
});

const privateAxios = axios.create({
  baseURL,
});

privateAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accesstoken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

privateAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axiosApi.post('/v1/auth/refresh-token', { refreshToken });
        const { accessToken } = response.data;

        localStorage.setItem('accesstoken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return privateAxios(originalRequest);
      } catch (error) {
        // Handle refresh token error or redirect to login
        localStorage.clear()
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export {
  axiosApi,
  privateAxios
};