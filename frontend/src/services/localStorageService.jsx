const KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    THEME: 'theme_settings'
};

const localStorageService = {
    // --- Metody Ogólne ---

    /**
     * Zapisuje dane do localStorage.
     * Automatycznie konwertuje obiekty/tablice na JSON.
     */
    setItem: (key, value) => {
        try {
            const valueToStore = typeof value === 'object'
                ? JSON.stringify(value)
                : value;
            localStorage.setItem(key, valueToStore);
        } catch (error) {
            console.error('Błąd zapisu do localStorage:', error);
        }
    },

    /**
     * Pobiera dane z localStorage.
     * Próbuje automatycznie parsować JSON.
     * Zwraca null, jeśli klucz nie istnieje.
     */
    getItem: (key) => {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;

            // Próbujemy parsować JSON (np. dla obiektów user_data)
            try {
                return JSON.parse(item);
            } catch (e) {
                // Jeśli to nie JSON (np. zwykły token string), zwracamy jako tekst
                return item;
            }
        } catch (error) {
            console.error('Błąd odczytu z localStorage:', error);
            return null;
        }
    },

    /**
     * Usuwa konkretny klucz.
     */
    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Błąd usuwania z localStorage:', error);
        }
    },

    /**
     * Czyści wszystko (używać ostrożnie).
     */
    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Błąd czyszczenia localStorage:', error);
        }
    },

    // --- Metody Specjalistyczne (Helpers) ---
    // Ułatwiają pracę z autoryzacją, żeby nie wpisywać kluczy ręcznie

    setAccessToken: (token) => {
        localStorage.setItem(KEYS.ACCESS_TOKEN, token);
    },

    getAccessToken: () => {
        return localStorage.getItem(KEYS.ACCESS_TOKEN);
    },

    removeAccessToken: () => {
        localStorage.removeItem(KEYS.ACCESS_TOKEN);
    },

    // Opcjonalnie: Refresh Token
    setRefreshToken: (token) => {
        localStorage.setItem(KEYS.REFRESH_TOKEN, token);
    },

    getRefreshToken: () => {
        return localStorage.getItem(KEYS.REFRESH_TOKEN);
    },

    // Obsługa wylogowania (czyści wszystkie tokeny)
    clearAuth: () => {
        localStorage.removeItem(KEYS.ACCESS_TOKEN);
        localStorage.removeItem(KEYS.REFRESH_TOKEN);
        localStorage.removeItem(KEYS.USER_DATA);
    }
};

export default localStorageService;