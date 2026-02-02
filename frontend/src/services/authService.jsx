import api from './api'; 
import localStorageService from './localStorageService';
import i18n from '../i18n';

const authService = {
    async login(email, password) {
        try {
            const response = await api.post('/users/login', {
                username: email, 
                password
            });

            const data = response.data;

            if (data.access_token) {
                localStorageService.setAccessToken(data.access_token);
                if (data.refresh_token) {
                    localStorageService.setRefreshToken(data.refresh_token);
                }
            }

            return data;
        } catch (error) {
            this.handleError(error);
        }
    },

    async register(userData) {
        try {
            const response = await api.post('/users/register', userData);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    },

    async verifyRecoveryToken(username, recoveryToken) {
        try {
            const response = await api.post('/users/recover-password', {
                username,
                recovery_token: recoveryToken
            });
            return response.data; // Should return { reset_token: "..." }
        } catch (error) {
            this.handleError(error);
        }
    },

    async resetPassword(resetToken, newPassword) {
        try {
            const response = await api.post('/users/reset-password', {
                token: resetToken,
                new_password: newPassword
            });
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    },

    handleError(error) {
        if (error.response && error.response.data) {
            const data = error.response.data;

            const rawErrorMsg = typeof data.detail === 'string'
                ? data.detail
                : (Array.isArray(data.detail) ? data.detail[0].msg : null);

            if (rawErrorMsg) {
                // Spróbuj przetłumaczyć błąd, jeśli klucz istnieje w słowniku błędów
                const translationKey = `errors.${rawErrorMsg}`;
                if (i18n.exists(translationKey)) {
                    throw new Error(i18n.t(translationKey));
                }
                // Jeśli brak tłumaczenia, zwróć oryginalny komunikat
                throw new Error(rawErrorMsg);
            }
            
            throw new Error(i18n.t('errors.unknown_error'));
        }

        if (error.request) {
            throw new Error(i18n.t('errors.network_error'));
        }

        throw new Error(i18n.t('errors.unknown_error'));
    }
};

export default authService;