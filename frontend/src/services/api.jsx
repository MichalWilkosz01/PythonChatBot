import axios from 'axios';
import localStorageService from './localStorageService';

// 1. Tworzymy instancję axios z bazowym URL
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000', // Twój adres backendu
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. REQUEST INTERCEPTOR (Wychodzące)
// Przed każdym zapytaniem automatycznie dodaj Access Token z localStorage
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

// 3. RESPONSE INTERCEPTOR (Przychodzące)
// Tutaj dzieje się magia Refresh Tokenu
api.interceptors.response.use(
    (response) => response, // Jeśli sukces, po prostu zwróć dane
    async (error) => {
        const originalRequest = error.config;

        // Jeśli błąd to 401 (Unauthorized) i nie jest to ponowna próba (_retry)
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Oznaczamy, żeby nie wpaść w pętlę nieskończoną

            try {
                // A. Pobierz refresh token
                const refreshToken = localStorageService.getRefreshToken();

                if (!refreshToken) {
                    // Jeśli nie ma refresh tokena, wyloguj usera
                    throw new Error("Brak refresh tokena");
                }

                // B. Wyślij żądanie o nowy access token
                // UWAGA: Sprawdź w swoim backendzie jaki masz endpoint i czego oczekuje (body czy header)
                const response = await axios.post('http://127.0.0.1:8000/refresh', {
                    refresh_token: refreshToken
                });

                // C. Jeśli sukces, zapisz nowy token
                const { access_token } = response.data;
                localStorageService.setAccessToken(access_token);

                // D. Zaktualizuj nagłówek w oryginalnym zapytaniu
                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

                // E. Ponów oryginalne zapytanie z nowym tokenem
                return api(originalRequest);

            } catch (refreshError) {
                // F. Jeśli refresh też się nie udał (np. wygasł) -> Wyloguj usera
                console.error("Sesja wygasła:", refreshError);
                localStorageService.clearAuth();
                window.location.href = '/'; // Lub przeładuj stronę, by React przeniósł na Login
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;