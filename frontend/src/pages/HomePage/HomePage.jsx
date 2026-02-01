import React, { useState, useEffect } from 'react';
import './HomePage.css';
import LandingView from './components/LandingView';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';

const HomePage = () => {
    // 1. SPRAWDZANIE TOKENA PRZY STARCIE (Lazy Initialization)
    // Funkcja w useState uruchamia się tylko raz przy odświeżeniu strony
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const token = localStorage.getItem('access_token');
        return !!token; // Zwraca true jeśli token istnieje, false jeśli nie
    });

    const chatHistory = [
        { id: 1, title: "Debugowanie pętli w Pythonie" },
        { id: 2, title: "Jak działa Django?" },
        { id: 3, title: "Optymalizacja kodu SQL" },
        { id: 4, title: "Generowanie wykresów Matplotlib" },
    ];

    // 2. FUNKCJE POMOCNICZE DO ZARZĄDZANIA SESJĄ

    const handleLogin = () => {
        // Tutaj normalnie byłoby zapytanie do API.
        // Na razie symulujemy zapisanie tokena:
        localStorage.setItem('access_token', 'przykladowy_token_jwt');
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        // Ważne: usuwamy token, żeby po odświeżeniu nie zalogowało nas ponownie
        localStorage.removeItem('access_token');
        setIsLoggedIn(false);
    };

    // --- WIDOKI ---

    if (isLoggedIn) {
        return (
            <div className="dashboard-container">
                <Sidebar
                    history={chatHistory}
                    onLogout={handleLogout} // Używamy nowej funkcji handleLogout
                />
                <ChatArea />
            </div>
        );
    }

    return (
        <LandingView onLogin={handleLogin} /> // Używamy nowej funkcji handleLogin
    );
};

export default HomePage;