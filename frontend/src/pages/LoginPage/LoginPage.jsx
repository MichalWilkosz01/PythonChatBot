import React, { useState } from 'react';
import { User, Mail, Lock, Key, ArrowRight, Loader2, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import authService from '../../services/authService';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import './LoginPage.css';

const LoginPage = ({ onLoginSuccess }) => {
    const { t } = useTranslation();
    const [isLoginView, setIsLoginView] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        gemini_api_key: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError(null);
    };

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            let data;
            if (isLoginView) {
                data = await authService.login(formData.email, formData.password);
            } else {
                data = await authService.register(formData);
            }
            console.log(data)
            const token = data.access_token || data.token;
            if (token) {
                onLoginSuccess(token);
            } else {
                throw new Error(t('login.errorToken'));
            }
        } catch (err) {
            setError(err.message || t('login.errorGeneric'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <LanguageSwitcher style={{ position: 'absolute', top: '20px', right: '20px' }} />
            <div className="glass-card login-card-adjustments">
                <div className="header-section">
                    <h1>{isLoginView ? t('login.welcomeBack') : t('login.createAccount')}</h1>
                    <p className="description">
                        {isLoginView
                            ? t('login.loginToContinue')
                            : t('login.fillDetails')}
                    </p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="form-container" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <Mail className="input-icon" size={20} />
                        <input
                            type="email"
                            name="email"
                            placeholder={t('login.emailPlaceholder')}
                            className="input-field"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {!isLoginView && (
                        <>
                            <div className="input-group">
                                <User className="input-icon" size={20} />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder={t('login.usernamePlaceholder')}
                                    className="input-field"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <Key className="input-icon" size={20} />
                                <input
                                    type="password"
                                    name="gemini_api_key"
                                    placeholder={t('login.apiKeyPlaceholder')}
                                    className="input-field with-info"
                                    value={formData.gemini_api_key}
                                    onChange={handleInputChange}
                                    required
                                />
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="input-info-link"
                                    title={t('login.learnMore')}
                                >
                                    <HelpCircle size={18} />
                                </a>
                            </div>
                        </>
                    )}

                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            name="password"
                            placeholder={t('login.passwordPlaceholder')}
                            className="input-field"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="spinner" size={20} />
                        ) : (
                            <>
                                {isLoginView ? t('login.loginButton') : t('login.registerButton')}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="toggle-container">
                    <p>
                        {isLoginView ? t('login.noAccount') : t('login.hasAccount')}
                        <span className="toggle-link" onClick={toggleView}>
                            {isLoginView ? t('login.registerButton') : t('login.loginButton')}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;