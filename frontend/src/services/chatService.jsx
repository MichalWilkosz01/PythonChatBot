import api from './api'; // Importujemy twoją instancję Axios

const chatService = {
    /**
     * Pobiera listę konwersacji zalogowanego użytkownika.
     * Endpoint: GET /chat/conversations
     */
    async getConversations() {
        // api.get automatycznie dodaje nagłówek Authorization: Bearer ...
        // oraz obsługuje refresh token w tle.
        const response = await api.get('/chat/conversations');
        return response.data;
    },

    /**
     * (Opcjonalnie) Tworzenie nowej konwersacji
     */
    async createConversation(title) {
        const response = await api.post('/chat/conversations', { title });
        return response.data;
    },
    async sendMessage(conversationId, message) {
        const response = await api.post(`/chat`, {
            query: message,
            conversation_id: Number(conversationId) // Dodajemy ID do body zgodnie z Twoją specyfikacją
        });
        return response.data;
    },
    /**
     * (Opcjonalnie) Pobieranie wiadomości dla konkretnej konwersacji
     */
    async getMessages(conversationId) {
        const response = await api.get(`/chat/history?conversation_id=${conversationId}`);
        return response.data;
    }
};

export default chatService;