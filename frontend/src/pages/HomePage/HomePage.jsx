import React, { useState, useEffect, useCallback } from 'react';
import './HomePage.css';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import LoginPage from '../LoginPage/LoginPage';
import localStorageService from '../../services/localStorageService';
import chatService from '../../services/chatService';

// Funkcja pomocnicza do dekodowania JWT
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

    // --- NOWA FUNKCJA: Obsługa dodania nowej wiadomości bez odświeżania ---
    const handleMessageUpdate = (newMessage) => {
        // Dodajemy nową wiadomość do istniejącej tablicy wiadomości
        setCurrentMessages((prevMessages) => [...prevMessages, newMessage]);

        // Opcjonalnie: Tutaj można by też zaktualizować listę chatHistory, 
        // np. przenieść aktywny czat na górę listy, ale to dodatkowy feature.
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

    // --- RENDEROWANIE ---

    if (isLoggedIn) {
        return (
            <div className="dashboard-container">
                <Sidebar
                    history={chatHistory}
                    onLogout={handleLogout}
                    userData={userData}
                    onSelectChat={handleChatSelect}
                    activeChatId={activeChatId}
                />
                <ChatArea
                    messages={currentMessages}
                    isLoading={isChatLoading}
                    activeChatId={activeChatId}
                    // Przekazujemy funkcję aktualizującą stan
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