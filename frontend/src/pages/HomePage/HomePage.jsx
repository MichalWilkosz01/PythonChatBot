import React, { useState, useEffect, useCallback } from 'react';
import './HomePage.css';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import LoginPage from '../LoginPage/LoginPage';

const HomePage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('access_token'));
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('access_token');
        setChatHistory([]);
        setIsLoggedIn(false);
    }, []);


    const handleLogin = (token) => {
        if (token) {
            localStorage.setItem('access_token', token);
            setIsLoggedIn(true);
        }
    };

    useEffect(() => {
        let isMounted = true;

        if (isLoggedIn) {
            const fetchHistory = async () => {
                setIsLoading(true);
                try {
                    const token = localStorage.getItem('access_token');
                    const response = await fetch('http://127.0.0.1:8000/login', {
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
                    isLoading={isLoading}
                />
                <ChatArea />
            </div>
        );
    }

    // LandingView musi przekazać onLoginSuccess do LoginPage
    return (
        <LoginPage onLoginSuccess={handleLogin} />
    );
};

export default HomePage;