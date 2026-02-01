import axios from 'axios';
import localStorageService from './localStorageService';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000', 
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorageService.getAccessToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response, 
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; 

            try {
                const refreshToken = localStorageService.getRefreshToken();

                if (!refreshToken) {
                    throw new Error("Brak refresh tokena");
                }

                const response = await axios.post('http://127.0.0.1:8000/refresh', {
                    refresh_token: refreshToken
                });

                const { access_token } = response.data;
                localStorageService.setAccessToken(access_token);

                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

                return api(originalRequest);

            } catch (refreshError) {
                console.error("Sesja wygasła:", refreshError);
                localStorageService.clearAuth();
                window.location.href = '/'; 
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;