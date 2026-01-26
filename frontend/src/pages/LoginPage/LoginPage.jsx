import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight } from 'lucide-react'; // Opcjonalnie: ikonki dla lepszego efektu
import './LoginPage.css';

const LoginPage = () => {
    // Stan decydujący, który widok pokazać (true = logowanie, false = rejestracja)
    const [isLoginView, setIsLoginView] = useState(true);

    // Przykładowe stany dla formularzy (do późniejszego wykorzystania)
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(isLoginView ? "Logowanie..." : "Rejestracja...", formData);
        // Tutaj dodałbyś logikę połączenia z backendem
    };

    return (
        <div className="login-container">
            <div className="glass-card login-card-adjustments">
                <div className="header-section">
                    <h1>{isLoginView ? 'Witaj ponownie!' : 'Stwórz konto'}</h1>
                    <p className="description">
                        {isLoginView
                            ? 'Zaloguj się, aby kontynuować pracę z asystentem.'
                            : 'Dołącz do nas i zacznij korzystać z SmartBot AI.'}
                    </p>
                </div>

                <form className="form-container" onSubmit={handleSubmit}>
                    {/* Pole Nazwa Użytkownika - widoczne tylko przy rejestracji */}
                    {!isLoginView && (
                        <div className="input-group">
                            <User className="input-icon" size={20} />
                            <input
                                type="text"
                                name="username"
                                placeholder="Nazwa użytkownika"
                                className="input-field"
                                value={formData.username}
                                onChange={handleInputChange}
                                required={!isLoginView}
                            />
                        </div>
                    )}

                    {/* Pole Email */}
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

                    {/* Pole Hasło */}
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

                    <button type="submit" className="submit-btn">
                        {isLoginView ? 'Zaloguj się' : 'Zarejestruj się'}
                        <ArrowRight size={20} />
                    </button>
                </form>

                {/* Przełącznik Logowanie / Rejestracja */}
                <div className="toggle-container">
                    <p>
                        {isLoginView ? 'Nie masz jeszcze konta? ' : 'Masz już konto? '}
                        <span
                            className="toggle-link"
                            onClick={() => setIsLoginView(!isLoginView)}
                        >
                            {isLoginView ? 'Zarejestruj się' : 'Zaloguj się'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;