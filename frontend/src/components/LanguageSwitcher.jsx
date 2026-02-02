import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = ({ style = {}, className = '' }) => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'pl' ? 'en' : 'pl';
        i18n.changeLanguage(newLang);
    };

    return (
        <button 
            onClick={toggleLanguage} 
            className={`language-switcher ${className}`}
            title={i18n.language === 'pl' ? "Switch to English" : "Przełącz na polski"}
            style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                zIndex: 1000,
                ...style
            }}
        >
            <Globe size={16} />
            <span>{i18n.language === 'pl' ? 'PL' : 'EN'}</span>
        </button>
    );
};

export default LanguageSwitcher;
