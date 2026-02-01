import React, { useState } from 'react';
import { User, Mail, Lock, Key, ArrowRight, Loader2 } from 'lucide-react';
import authService from '../../services/authService';
import './LoginPage.css';

const LoginPage = ({ onLoginSuccess }) => {
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
                throw new Error("Nie otrzymano tokenu autoryzacyjnego.");
            }
        } catch (err) {
            setError(err.message || 'Wystąpił nieoczekiwany błąd.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="glass-card login-card-adjustments">
                <div className="header-section">
                    <h1>{isLoginView ? 'Witaj ponownie!' : 'Stwórz konto'}</h1>
                    <p className="description">
                        {isLoginView
                            ? 'Zaloguj się, aby kontynuować.'
                            : 'Wypełnij dane, aby się zarejestrować.'}
                    </p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="form-container" onSubmit={handleSubmit}>
                    {/* Email - zawsze widoczny */}
                    <div className="input-group">
                        <Mail className="input-icon" size={20} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Adres email"
                            className="input-field"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Pola widoczne tylko przy REJESTRACJI */}
                    {!isLoginView && (
                        <>
                            <div className="input-group">
                                <User className="input-icon" size={20} />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Nazwa użytkownika"
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
                                    placeholder="Gemini API Key"
                                    className="input-field"
                                    value={formData.gemini_api_key}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Hasło - zawsze widoczne */}
                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            name="password"
                            placeholder="Hasło"
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
                                {isLoginView ? 'Zaloguj się' : 'Zarejestruj się'}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="toggle-container">
                    <p>
                        {isLoginView ? 'Nie masz jeszcze konta? ' : 'Masz już konto? '}
                        <span className="toggle-link" onClick={toggleView}>
                            {isLoginView ? 'Zarejestruj się' : 'Zaloguj się'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;