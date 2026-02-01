import React from 'react';
import { MessageSquare, Plus, History, User, LogOut } from 'lucide-react';

const Sidebar = ({ history, onLogout }) => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-small">
                    <MessageSquare size={24} className="icon-blue" />
                    <span>SmartBot</span>
                </div>
                <button className="new-chat-btn">
                    <Plus size={16} /> Nowy czat
                </button>
            </div>

            <div className="history-list">
                <p className="history-label">Historia</p>
                {history.map((chat) => (
                    <div key={chat.id} className="history-item">
                        <History size={16} />
                        <span>{chat.title}</span>
                    </div>
                ))}
            </div>

            <div className="user-section">
                <div className="user-info">
                    <User size={20} />
                    <span>Użytkownik</span>
                </div>
                <button onClick={onLogout} className="logout-btn" title="Wyloguj się">
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;