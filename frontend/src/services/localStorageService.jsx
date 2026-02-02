const KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    THEME: 'theme_settings'
};

const localStorageService = {
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

    getItem: (key) => {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;

            try {
                return JSON.parse(item);
            } catch (e) {
                return item;
            }
        } catch (error) {
            console.error('Błąd odczytu z localStorage:', error);
            return null;
        }
    },

    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Błąd usuwania z localStorage:', error);
        }
    },

    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Błąd czyszczenia localStorage:', error);
        }
    },

    setAccessToken: (token) => {
        localStorage.setItem(KEYS.ACCESS_TOKEN, token);
    },

    getAccessToken: () => {
        return localStorage.getItem(KEYS.ACCESS_TOKEN);
    },

    removeAccessToken: () => {
        localStorage.removeItem(KEYS.ACCESS_TOKEN);
    },

    setRefreshToken: (token) => {
        localStorage.setItem(KEYS.REFRESH_TOKEN, token);
    },

    getRefreshToken: () => {
        return localStorage.getItem(KEYS.REFRESH_TOKEN);
    },

    clearAuth: () => {
        localStorage.removeItem(KEYS.ACCESS_TOKEN);
        localStorage.removeItem(KEYS.REFRESH_TOKEN);
        localStorage.removeItem(KEYS.USER_DATA);
    }
};

export default localStorageService;