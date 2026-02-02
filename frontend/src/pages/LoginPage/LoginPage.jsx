import React, { useState } from 'react';
import { User, Mail, Lock, Key, ArrowRight, Loader2, HelpCircle, Shield, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import authService from '../../services/authService';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import toast from 'react-hot-toast';
import './LoginPage.css';

const LoginPage = ({ onLoginSuccess }) => {
    const { t } = useTranslation();
    const [view, setView] = useState('login'); // 'login', 'register', 'recovery_step1', 'recovery_step2'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resetToken, setResetToken] = useState(null);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        gemini_api_key: '',
        recoveryToken: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError(null);
    };

    const toggleView = (newView) => {
        setView(newView);
        setError(null);
        setFormData({ ...formData, password: '', confirmPassword: '', recoveryToken: '', newPassword: '', confirmNewPassword: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (view === 'login') {
                const data = await authService.login(formData.email, formData.password);
                const token = data.access_token || data.token;
                if (token) onLoginSuccess(token);
                else throw new Error(t('login.errorToken'));

            } else if (view === 'register') {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error(t('login.errorPasswordsDoNotMatch', 'Passwords do not match'));
                }
                const { confirmPassword, recoveryToken, newPassword, confirmNewPassword, ...registrationData } = formData;
                const data = await authService.register(registrationData);
                const token = data.access_token || data.token;
                if (token) onLoginSuccess(token);
                else throw new Error(t('login.errorToken'));

            } else if (view === 'recovery_step1') {
                const data = await authService.verifyRecoveryToken(formData.username, formData.recoveryToken);
                if (data.reset_token) {
                   setResetToken(data.reset_token);
                   setView('recovery_step2');
                }

            } else if (view === 'recovery_step2') {
                if (formData.newPassword !== formData.confirmNewPassword) {
                    throw new Error(t('login.errorPasswordsDoNotMatch', 'Passwords do not match'));
                }
                await authService.resetPassword(resetToken, formData.newPassword);
                toast.success(t('login.passwordResetSuccess', 'Password Reset Successful'));
                setView('login');
            }

        } catch (err) {
            setError(err.message || t('login.errorGeneric'));
        } finally {
            setIsLoading(false);
        }
    };

    const isRecovery = view.startsWith('recovery');

    return (
        <div className="login-container">
            <LanguageSwitcher style={{ position: 'absolute', top: '20px', right: '20px' }} />
            <div className="glass-card login-card-adjustments">
                <div className="header-section">
                    <h1>
                        {view === 'login' && t('login.welcomeBack')}
                        {view === 'register' && t('login.createAccount')}
                        {isRecovery && t('login.recoverTitle')}
                    </h1>
                    <p className="description">
                        {view === 'login' && t('login.loginToContinue')}
                        {view === 'register' && t('login.fillDetails')}
                        {view === 'recovery_step1' && t('login.recoverStep1Desc')}
                        {view === 'recovery_step2' && t('login.recoverStep2Desc')}
                    </p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="form-container" onSubmit={handleSubmit}>
                    
                    {/* --- LOGIN & REGISTER FIELDS --- */}
                    {(view === 'login' || view === 'register') && (
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
                    )}

                    {view === 'register' && (
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

                    {(view === 'login' || view === 'register') && (
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
                    )}

                    {view === 'register' && (
                        <div className="input-group">
                            <Lock className="input-icon" size={20} />
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder={t('login.confirmPasswordPlaceholder', 'Confirm Password')}
                                className="input-field"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    )}

                    {/* --- RECOVERY STEP 1 --- */}
                    {view === 'recovery_step1' && (
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
                                <Shield className="input-icon" size={20} />
                                <input
                                    type="text"
                                    name="recoveryToken"
                                    placeholder={t('login.tokenPlaceholder')}
                                    className="input-field"
                                    value={formData.recoveryToken}
                                    onChange={handleInputChange}
                                    required
                                    autoComplete="off"
                                />
                            </div>
                        </>
                    )}

                     {/* --- RECOVERY STEP 2 --- */}
                     {view === 'recovery_step2' && (
                        <>
                             <div className="input-group">
                                <Lock className="input-icon" size={20} />
                                <input
                                    type="password"
                                    name="newPassword"
                                    placeholder={t('profile.newPasswordPlaceholder')}
                                    className="input-field"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <Lock className="input-icon" size={20} />
                                <input
                                    type="password"
                                    name="confirmNewPassword"
                                    placeholder={t('profile.confirmPasswordPlaceholder')}
                                    className="input-field"
                                    value={formData.confirmNewPassword}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* --- ACTION BUTTON --- */}
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="spinner" size={20} />
                        ) : (
                            <>
                                {view === 'login' && (
                                    <>
                                        {t('login.loginButton')} <ArrowRight size={20} />
                                    </>
                                )}
                                {view === 'register' && (
                                    <>
                                        {t('login.registerButton')} <ArrowRight size={20} />
                                    </>
                                )}
                                {view === 'recovery_step1' && t('login.verifyButton')}
                                {view === 'recovery_step2' && t('login.resetButton')}
                            </>
                        )}
                    </button>
                    
                    {/* --- FORGOT PASSWORD LINK --- */}
                    {view === 'login' && (
                         <div className="forgot-password-link" onClick={() => toggleView('recovery_step1')}>
                            {t('login.forgotPassword')}
                        </div>
                    )}

                </form>

                {/* --- TOGGLE VIEW --- */}
                {!isRecovery ? (
                    <div className="toggle-container">
                        <p>
                            {view === 'login' ? t('login.noAccount') : t('login.hasAccount')}
                            <span className="toggle-link" onClick={() => toggleView(view === 'login' ? 'register' : 'login')}>
                                {view === 'login' ? t('login.registerButton') : t('login.loginButton')}
                            </span>
                        </p>
                    </div>
                ) : (
                     <div className="toggle-container">
                        <span className="toggle-link" onClick={() => toggleView('login')}>
                             <RotateCcw size={14} style={{ marginRight: '5px' }} />
                            {t('login.backToLogin')}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPage;