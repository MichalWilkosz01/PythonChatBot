import React from 'react';
import { MessageSquare } from 'lucide-react';

const LandingView = ({ onLogin }) => {
    return (
        <div className="home-container">
            <div className="glass-card">
                <div className="logo-section">
                    <MessageSquare size={40} className="icon" />
                    <h1>ChatBot</h1>
                </div>
                <p className="description">
                    Asystent do wspomagania Twojej pracy w Pythonie!
                    <br />Zaloguj się, aby uzyskać dostęp do historii.
                </p>
                <button className="start-btn" onClick={onLogin}>
                    Zaloguj się
                </button>
            </div>
        </div>
    );
};

export default LandingView;