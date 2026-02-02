import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, History, User, LogOut, Trash2, X, Save, Key, Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import userService from '../../../services/userService';
import toast from 'react-hot-toast';
import './Sidebar.css';

const Sidebar = ({
    history,
    onLogout,
    userData,
    onSelectChat,
    activeChatId,
    onNewChat,
    onDeleteChat,
    onUpdateUser
}) => {
    const { t } = useTranslation();
    const displayName = userData?.username || userData?.email || t('sidebar.user');

    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        apiKey: ''
    });

    const [tokenPassword, setTokenPassword] = useState('');
    const [recoveryTokens, setRecoveryTokens] = useState([]);
    const [isTokenViewVisible, setIsTokenViewVisible] = useState(false);
    const [tokenError, setTokenError] = useState(null);
    const [copiedTokenIndex, setCopiedTokenIndex] = useState(null);
    
    useEffect(() => {
        if (userData && isProfileOpen) {
            setEditForm({
                username: userData.username || '',
                email: userData.email || '',
                apiKey: userData.api_key || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setRecoveryTokens([]);
            setTokenPassword('');
            setIsTokenViewVisible(false);
            setTokenError(null);
            setCopiedTokenIndex(null);
        }
    }, [userData, isProfileOpen]);

    const handleRevealTokens = async () => {
        setTokenError(null);
        try {
           const tokens = await userService.revealTokens(tokenPassword);
           setRecoveryTokens(tokens);
           setIsTokenViewVisible(true);
        } catch (err) {
            setTokenError(t('errors.Invalid password', 'Invalid password'));
        }
    };

    const handleCopyToken = (token, index) => {
        navigator.clipboard.writeText(token);
        setCopiedTokenIndex(index);
        setTimeout(() => setCopiedTokenIndex(null), 2000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();

        if (editForm.newPassword || editForm.confirmPassword) {
            if (editForm.newPassword !== editForm.confirmPassword) {
                toast.error(t('profile.passwordMismatch', 'New passwords do not match!'));
                return;
            }
            if (!editForm.currentPassword) {
                toast.error(t('profile.currentPasswordRequired', 'Current password is required to set a new one.'));
                return;
            }
        }

        if (onUpdateUser) {
            onUpdateUser({
                username: editForm.username,
                email: editForm.email,
                new_password: editForm.newPassword,
                api_key: editForm.apiKey
            });
        }
        setIsProfileOpen(false);
    };

    return (
        <>
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
                            className={`history-item ${activeChatId === chat.id ? 'active' : ''} history-item-inner`}
                            onClick={() => onSelectChat(chat.id)}
                        >
                            <div className="history-title-wrapper">
                                <History size={16} className="history-icon" />
                                <span className="truncate">{chat.title}</span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteChat(chat.id);
                                }}
                                className="delete-btn history-delete-btn"
                                title={t('sidebar.deleteChat')}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="user-section">
                    <div
                        className="user-info user-info-clickable"
                        onClick={() => setIsProfileOpen(true)}
                        title={t('sidebar.editProfile', 'Edit Profile')}
                    >
                        <User size={20} />
                        <span>{displayName}</span>
                    </div>
                    <div className="user-actions">
                        <div className="lang-switcher-wrapper">
                            <LanguageSwitcher />
                        </div>
                        <button onClick={onLogout} className="logout-btn" title={t('sidebar.logout')}>
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {isProfileOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">
                                <User size={20} /> {t('profile.title', 'Edit Profile')}
                            </h3>
                            <button
                                onClick={() => setIsProfileOpen(false)}
                                className="modal-close-btn"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProfile} className="modal-form">
                            <InputGroup
                                icon={<User size={16} />}
                                name="username"
                                value={editForm.username}
                                onChange={handleInputChange}
                                placeholder={t('login.usernamePlaceholder', 'Username')}
                            />

                            <InputGroup
                                icon={<Mail size={16} />}
                                name="email"
                                value={editForm.email}
                                onChange={handleInputChange}
                                placeholder={t('login.emailPlaceholder', 'Email')}
                                type="email"
                            />

                            <div style={{ borderTop: '1px solid #333', margin: '5px 0' }}></div>

                            <InputGroup
                                icon={<Lock size={16} />}
                                name="currentPassword"
                                value={editForm.currentPassword}
                                onChange={handleInputChange}
                                placeholder={t('profile.currentPasswordPlaceholder', 'Current Password')}
                                type="password"
                            />

                            <InputGroup
                                icon={<Lock size={16} />}
                                name="newPassword"
                                value={editForm.newPassword}
                                onChange={handleInputChange}
                                placeholder={t('profile.newPasswordPlaceholder', 'New Password')}
                                type="password"
                            />

                            <InputGroup
                                icon={<Lock size={16} />}
                                name="confirmPassword"
                                value={editForm.confirmPassword}
                                onChange={handleInputChange}
                                placeholder={t('profile.confirmPasswordPlaceholder', 'Repeat New Password')}
                                type="password"
                            />

                            <div style={{ borderTop: '1px solid #333', margin: '5px 0' }}></div>

                            <InputGroup
                                icon={<Key size={16} />}
                                name="apiKey"
                                value={editForm.apiKey}
                                onChange={handleInputChange}
                                placeholder={t('login.apiKeyPlaceholder', 'Gemini API Key')}
                                type="password"
                            />

                            <button type="submit" className="save-btn">
                                <Save size={18} /> {t('profile.save', 'Save Changes')}
                            </button>
                        </form>
                        
                        <div style={{ borderTop: '1px solid #333', margin: '20px 0' }}></div>
                        
                        <div className="recovery-tokens-section">
                            <h4 className="modal-subtitle">
                                <Shield size={16} /> {t('profile.recoveryTokensTitle', 'Recovery Tokens')}
                            </h4>
                            
                            {!isTokenViewVisible ? (
                                <div className="token-auth-container">
                                    <InputGroup
                                        icon={<Lock size={16} />}
                                        name="tokenPassword"
                                        value={tokenPassword}
                                        onChange={(e) => setTokenPassword(e.target.value)}
                                        placeholder={t('profile.enterPasswordToShow', 'Enter password to view tokens')}
                                        type="password"
                                    />
                                    <button 
                                        type="button" 
                                        className="view-tokens-btn"
                                        onClick={handleRevealTokens}
                                        disabled={!tokenPassword}
                                    >
                                        {t('profile.viewTokens', 'View')}
                                    </button>
                                </div>
                            ) : (
                                <div className="tokens-grid">
                                    {recoveryTokens && recoveryTokens.length > 0 ? (
                                        recoveryTokens.map((token, index) => (
                                            <div 
                                                key={index} 
                                                className="token-chip" 
                                                title={t('profile.copyToken', 'Copy')}
                                                onClick={() => handleCopyToken(token, index)}
                                            >
                                                {copiedTokenIndex === index ? t('chat.copied', 'Copied!') : token}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-tokens">{t('errors.No recovery tokens found', 'No tokens found')}</p>
                                    )}
                                </div>
                            )}
                            {tokenError && <p className="error-text">{tokenError}</p>}
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};

// --- Komponent pomocniczy ---
const InputGroup = ({ icon, name, value, onChange, placeholder, type = "text" }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === "password";

    return (
        <div className="sidebar-input-group">
            <div className="sidebar-input-group-icon">{icon}</div>
            <input
                type={isPasswordType ? (showPassword ? "text" : "password") : type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="sidebar-input-group-field"
                autoComplete="off"
            />
            {isPasswordType && (
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-btn"
                    tabIndex="-1"
                >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            )}
        </div>
    );
};

export default Sidebar;