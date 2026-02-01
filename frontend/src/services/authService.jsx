const API_URL = 'http://127.0.0.1:8000';

const authService = {
    async login(email, password) {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password }),
        });
        return this.handleResponse(response);
    },

    async register(userData) {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return this.handleResponse(response);
    },

    async handleResponse(response) {
        const data = await response.json();

        if (!response.ok) {
            // Obsługa błędów walidacji Pydantic (422) lub innych (401, 400)
            const errorMsg = typeof data.detail === 'string'
                ? data.detail
                : (Array.isArray(data.detail) ? data.detail[0].msg : 'Wystąpił nieoczekiwany błąd.');
            throw new Error(errorMsg);
        }

        return data;
    }
};

export default authService;