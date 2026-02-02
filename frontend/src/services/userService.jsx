import api from './api';

const updateProfile = async (userData) => {
    const response = await api.patch('/users/edit', userData);
    return response.data;
};

const getProfile = async () => {
    const response = await api.get('/users/account');
    return response.data;
};

const revealTokens = async (password) => {
    const response = await api.post('/users/reveal-tokens', { password });
    return response.data;
};

export default {
    updateProfile,
    getProfile,
    revealTokens
};