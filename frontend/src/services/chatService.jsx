import api from './api'; 

const chatService = {
    async getConversations() {
        const response = await api.get('/chat/conversations');
        return response.data;
    },

    async createConversation(title) {
        const response = await api.post('/chat/new', { title });
        return response.data;
    },
    async deleteConversation(conversationId) {
        const response = await api.delete(`/chat/${conversationId}`);
        return response.data;
    },
    async sendMessage(conversationId, message) {
        const response = await api.post(`/chat`, {
            query: message,
            conversation_id: Number(conversationId) 
        });
        return response.data;
    },
    async getMessages(conversationId) {
        const response = await api.get(`/chat/history?conversation_id=${conversationId}`);
        return response.data;
    }
};

export default chatService;