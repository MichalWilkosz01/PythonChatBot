import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  pl: {
    translation: {
      login: {
        welcomeBack: "Witaj ponownie!",
        createAccount: "Stwórz konto",
        loginToContinue: "Zaloguj się, aby kontynuować.",
        fillDetails: "Wypełnij dane, aby się zarejestrować.",
        emailPlaceholder: "Adres email",
        usernamePlaceholder: "Nazwa użytkownika",
        passwordPlaceholder: "Hasło",
        apiKeyPlaceholder: "Klucz API Gemini",
        loginButton: "Zaloguj się",
        registerButton: "Zarejestruj się",
        noAccount: "Nie masz jeszcze konta? ",
        hasAccount: "Masz już konto? ",
        learnMore: "Dowiedz się więcej",
        errorToken: "Nie otrzymano tokenu autoryzacyjnego.",
        errorGeneric: "Wystąpił nieoczekiwany błąd."
      },
      errors: {
        "Username already exists": "Użytkownik o takiej nazwie już istnieje.",
        "Email already exists": "Ten adres email jest już zajęty.",
        "Invalid credentials": "Nieprawidłowy login lub hasło.",
        "Signature has expired": "Twoja sesja wygasła. Zaloguj się ponownie.",
        "network_error": "Brak połączenia z serwerem. Sprawdź internet.",
        "unknown_error": "Wystąpił nieoczekiwany błąd."
      },
      sidebar: {
        newChat: "Nowy czat",
        history: "Historia",
        user: "Użytkownik",
        logout: "Wyloguj się",
        deleteChat: "Usuń"
      },
      chat: {
        welcome: "Witaj w Python Chat Bot!",
        selectChat: "Wybierz konwersację, aby rozpocząć.",
        typeMessage: "Napisz wiadomość...",
        botReplying: "Bot odpowiada...",
        thinking: "Myślę...",
        connectionError: "Wystąpił problem z połączeniem.",
        poweredBy: "Zasilane przez Google Gemini",
        copy: "Kopiuj",
        copied: "Skopiowano!"
      },
      home: {
        confirmDelete: "Czy na pewno chcesz usunąć tę rozmowę?",
        newChatTitle: "Nowy czat"
      }
    }
  },
  en: {
    translation: {
      login: {
        welcomeBack: "Welcome back!",
        createAccount: "Create account",
        loginToContinue: "Log in to continue.",
        fillDetails: "Fill in the details to register.",
        emailPlaceholder: "Email address",
        usernamePlaceholder: "Username",
        passwordPlaceholder: "Password",
        apiKeyPlaceholder: "Gemini API Key",
        loginButton: "Log in",
        registerButton: "Register",
        noAccount: "Don't have an account? ",
        hasAccount: "Already have an account? ",
        learnMore: "Learn more",
        errorToken: "No authorization token received.",
        errorGeneric: "An unexpected error occurred."
      },
      errors: {
        "Username already exists": "Username is already taken.",
        "Email already exists": "This email address is already in use.",
        "Invalid credentials": "Invalid username or password.",
        "Signature has expired": "Your session has expired. Please log in again.",
        "network_error": "No connection to server. Check your internet.",
        "unknown_error": "An unexpected error occurred."
      },
      sidebar: {
        newChat: "New chat",
        history: "History",
        user: "User",
        logout: "Log out",
        deleteChat: "Delete"
      },
      chat: {
        welcome: "Welcome to Python Chat Bot!",
        selectChat: "Select a conversation to start.",
        typeMessage: "Type a message...",
        botReplying: "Bot is replying...",
        thinking: "Thinking...",
        connectionError: "Connection problem occurred.",
        poweredBy: "Powered by Google's Gemini",
        copy: "Copy",
        copied: "Copied!"
      },
      home: {
        confirmDelete: "Are you sure you want to delete this conversation?",
        newChatTitle: "New Chat"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "pl", // domyślny język
    fallbackLng: "pl",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
