import React from 'react';
import { MessageSquare, Plus, History, User, LogOut, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../../components/LanguageSwitcher';

const Sidebar = ({ history, onLogout, userData, onSelectChat, activeChatId, onNewChat, onDeleteChat }) => {
    const { t } = useTranslation();
    const displayName = userData?.username || userData?.email || t('sidebar.user');

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-small">
                    <MessageSquare size={24} className="icon-blue" />
                    <span>Python Chat Bot</span>
                </div>
                <button className="new-chat-btn" onClick={onNewChat}>
                    <Plus size={16} /> {t('sidebar.newChat')}
                </button>
            </div>

            <div className="history-list">
                <p className="history-label">{t('sidebar.history')}</p>
                {history.map((chat) => (
                    <div
                        key={chat.id}
                        className={`history-item ${activeChatId === chat.id ? 'active' : ''}`}
                        onClick={() => onSelectChat(chat.id)}
                        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flex: 1 }}>
                            <History size={16} style={{ minWidth: '16px', marginRight: '8px' }} />
                            <span className="truncate">{chat.title}</span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteChat(chat.id);
                            }}
                            className="delete-btn"
                            title={t('sidebar.deleteChat')}
                            style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyItems: 'center' }}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="user-section">
                <div className="user-info">
                    <User size={20} />
                    <span>{displayName}</span>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <div style={{ transform: 'scale(0.8)' }}>
                        <LanguageSwitcher />
                    </div>
                    <button onClick={onLogout} className="logout-btn" title={t('sidebar.logout')}>
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;