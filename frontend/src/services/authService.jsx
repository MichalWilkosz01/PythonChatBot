import api from './api'; // Upewnij się, że ścieżka do api.js jest poprawna
import localStorageService from './localStorageService';

const authService = {
    /**
     * Logowanie użytkownika
     */
    async login(email, password) {
        try {
            // Używamy api.post zamiast fetch
            // api.js ma już zdefiniowany baseURL
            const response = await api.post('/users/login', {
                username: email, // Backend oczekuje pola 'username'
                password
            });

            const data = response.data;

            // WARTOŚĆ DODANA:
            // Od razu zapisujemy tokeny w serwisie, aby interceptory api.js
            // mogły z nich korzystać przy kolejnych zapytaniach.
            if (data.access_token) {
                localStorageService.setAccessToken(data.access_token);
                // Jeśli backend zwraca też refresh token:
                if (data.refresh_token) {
                    localStorageService.setRefreshToken(data.refresh_token);
                }

                // Opcjonalnie: Dekodowanie i zapis danych użytkownika (jeśli nie robisz tego w HomePage)
                // const user = parseJwt(data.access_token);
                // localStorageService.setItem('user_data', { username: user.sub });
            }

            return data;
        } catch (error) {
            this.handleError(error);
        }
    },

    /**
     * Rejestracja użytkownika
     */
    async register(userData) {
        try {
            const response = await api.post('/users/register', userData);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    },

    /**
     * Ujednolicona obsługa błędów dla Axios + FastAPI (Pydantic)
     */
    handleError(error) {
        // 1. Sprawdź, czy serwer odpowiedział kodem błędu (np. 400, 401, 422)
        if (error.response && error.response.data) {
            const data = error.response.data;

            // Logika wyciągania komunikatu błędu (zgodna z FastAPI/Pydantic)
            const errorMsg = typeof data.detail === 'string'
                ? data.detail
                : (Array.isArray(data.detail) ? data.detail[0].msg : 'Wystąpił nieoczekiwany błąd serwera.');

            throw new Error(errorMsg);
        }

        // 2. Brak odpowiedzi serwera (np. serwer wyłączony, brak internetu)
        if (error.request) {
            throw new Error('Brak odpowiedzi z serwera. Sprawdź połączenie internetowe.');
        }

        // 3. Inny błąd (np. błąd w konfiguracji zapytania)
        throw new Error(error.message || 'Wystąpił nieznany błąd aplikacji.');
    }
};

export default authService;