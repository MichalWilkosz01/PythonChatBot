import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './HomePage.css';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import LoginPage from '../LoginPage/LoginPage';
import localStorageService from '../../services/localStorageService';
import chatService from '../../services/chatService';

const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

const HomePage = () => {
    const { t } = useTranslation();
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorageService.getAccessToken());
    const [userData, setUserData] = useState(() => localStorageService.getItem('user_data'));
    const [chatHistory, setChatHistory] = useState([]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [activeChatId, setActiveChatId] = useState(null);
    const [currentMessages, setCurrentMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = useCallback(() => {
        localStorageService.clearAuth();
        setChatHistory([]);
        setUserData(null);
        setIsLoggedIn(false);
    }, []);

    const handleLogin = (token) => {
        if (token) {
            localStorageService.setAccessToken(token);

            const decodedToken = parseJwt(token);

            if (decodedToken && decodedToken.sub) {
                const userPayload = { username: decodedToken.sub };
                localStorageService.setItem('user_data', userPayload);
                setUserData(userPayload);
            }

            setIsLoggedIn(true);
        }
    };

    const handleChatSelect = async (chatId) => {
        setActiveChatId(chatId);
        setIsChatLoading(true);
        try {
            const messages = await chatService.getMessages(chatId);
            setCurrentMessages(messages);
        } catch (error) {
            console.error("Nie udało się pobrać wiadomości", error);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleMessageUpdate = (newMessage) => {
        setCurrentMessages((prevMessages) => [...prevMessages, newMessage]);

        if (newMessage.title) {
            setChatHistory(prevHistory => 
                prevHistory.map(chat => 
                    chat.id === newMessage.conversation_id 
                        ? { ...chat, title: newMessage.title }
                        : chat
                )
            );
        }
    };

    const handleDeleteChat = async (chatId) => {
        if (window.confirm(t('home.confirmDelete'))) {
            try {
                await chatService.deleteConversation(chatId);
                setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
                if (activeChatId === chatId) {
                    setActiveChatId(null);
                    setCurrentMessages([]);
                }
            } catch (error) {
                console.error("Failed to delete chat", error);
            }
        }
    };

    const handleNewChat = async () => {
        try {
            const newChatData = await chatService.createConversation(t('home.newChatTitle'));
            const newChat = {
                id: newChatData.conversation_id,
                title: newChatData.title,
                created_at: new Date().toISOString() 
            };
            
            setChatHistory(prev => [newChat, ...prev]);
            setActiveChatId(newChat.id);
            setCurrentMessages([]);
        } catch (error) {
            console.error("Failed to create new chat", error);
        }
    };

    useEffect(() => {
        let isMounted = true;

        if (isLoggedIn) {
            const fetchHistory = async () => {
                setIsLoading(true);
                try {
                    const data = await chatService.getConversations();

                    if (isMounted) {
                        setChatHistory(data);
                    }
                } catch (error) {
                    console.error("Błąd pobierania historii czatów:", error);
                } finally {
                    if (isMounted) setIsLoading(false);
                }
            };

            fetchHistory();
        }

        return () => { isMounted = false; };
    }, [isLoggedIn]);


    if (isLoggedIn) {
        return (
            <div className="dashboard-container">
                <Sidebar
                    history={chatHistory}
                    onLogout={handleLogout}
                    userData={userData}
                    onSelectChat={handleChatSelect}
                    activeChatId={activeChatId}
                    onNewChat={handleNewChat}
                    onDeleteChat={handleDeleteChat}
                />
                <ChatArea
                    messages={currentMessages}
                    isLoading={isChatLoading}
                    activeChatId={activeChatId}
                    onMessageSent={handleMessageUpdate}
                />
            </div>
        );
    }

    return (
        <LoginPage onLoginSuccess={handleLogin} />
    );
};

export default HomePage;