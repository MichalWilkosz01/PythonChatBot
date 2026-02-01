import React, { useState, useEffect, useCallback } from 'react';
import './HomePage.css';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import LoginPage from '../LoginPage/LoginPage';
import localStorageService from '../../services/localStorageService';

// Funkcja pomocnicza do dekodowania JWT (bez instalowania dodatkowych bibliotek)
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
                console.log(userPayload)
                localStorageService.setItem('user_data', userPayload);
                setUserData(userPayload);
            }

            setIsLoggedIn(true);
        }
    };

    useEffect(() => {
        let isMounted = true;

        if (isLoggedIn) {
            const fetchHistory = async () => {
                setIsLoading(true);
                try {
                    // Używamy serwisu do pobrania tokena
                    const token = localStorageService.getAccessToken();

                    // Upewnij się, że ten URL jest poprawny (wcześniej miałeś błąd 404/405)
                    const response = await fetch('http://127.0.0.1:8000/chat/history', { // <-- Zmieniłem na /chats, sprawdź swój endpoint!
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (isMounted) setChatHistory(data);
                    } else if (response.status === 401) {
                        handleLogout();
                    }
                } catch (error) {
                    console.error("Błąd sieci:", error);
                } finally {
                    if (isMounted) setIsLoading(false);
                }
            };

            fetchHistory();
        }

        return () => { isMounted = false; };
    }, [isLoggedIn, handleLogout]);

    // --- RENDEROWANIE ---

    if (isLoggedIn) {
        return (
            <div className="dashboard-container">
                <Sidebar
                    history={chatHistory}
                    onLogout={handleLogout}
                    // isLoading={isLoading} // Sidebar zazwyczaj nie potrzebuje loadera, chyba że chcesz go tam wyświetlać
                    userData={userData} // Teraz userData jest poprawnie przekazywane
                />
                <ChatArea />
            </div>
        );
    }

    return (
        <LoginPage onLoginSuccess={handleLogin} />
    );
};

export default HomePage;