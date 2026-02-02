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
        errorGeneric: "Wystąpił nieoczekiwany błąd.",
        confirmPasswordPlaceholder: "Powtórz hasło",
        errorPasswordsDoNotMatch: "Hasła nie są identyczne",
        forgotPassword: "Nie pamiętam hasła",
        recoverTitle: "Odzyskiwanie hasła",
        recoverStep1Desc: "Podaj nazwę użytkownika i jeden z tokenów odzyskiwania.",
        recoverStep2Desc: "Ustaw nowe hasło dla swojego konta.",
        tokenPlaceholder: "Token odzyskiwania",
        verifyButton: "Weryfikuj token",
        resetButton: "Zmień hasło",
        backToLogin: "Powrót do logowania",
        passwordResetSuccess: "Hasło zostało pomyślnie zmienione! Zaloguj się ponownie."
      },
      profile: {
          title: "Edytuj profil",
          passwordMismatch: "Nowe hasła nie są identyczne!",
          currentPasswordRequired: "Wymagane jest obecne hasło, aby ustawić nowe.",
          updateError: "Nie udało się zaktualizować profilu",
          save: "Zapisz zmiany",
          confirmPasswordPlaceholder: "Powtórz nowe hasło",
          currentPasswordPlaceholder: "Obecne hasło",
          newPasswordPlaceholder: "Nowe hasło",
          recoveryTokensTitle: "Tokeny odzyskiwania",
          showTokens: "Pokaż tokeny",
          enterPasswordToShow: "Wpisz hasło, aby zobaczyć tokeny",
          viewTokens: "Zobacz",
          copyToken: "Kopiuj"
      },
      errors: {
        "Username already exists": "Użytkownik o takiej nazwie już istnieje.",
        "Email already exists": "Ten adres email jest już zajęty.",
        "Invalid credentials": "Nieprawidłowy login lub hasło.",
        "Signature has expired": "Twoja sesja wygasła. Zaloguj się ponownie.",
        "network_error": "Brak połączenia z serwerem. Sprawdź internet.",
        "unknown_error": "Wystąpił nieoczekiwany błąd.",
        "User not found": "Nie znaleziono użytkownika.",
        "No recovery tokens found": "Użytkownik nie posiada tokenów odzyskiwania.",
        "Invalid recovery token": "Nieprawidłowy token odzyskiwania.",
        "Invalid or expired reset token": "Sesja resetowania hasła wygasła.",
        "Invalid password": "Nieprawidłowe hasło."
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
        errorGeneric: "An unexpected error occurred.",
        confirmPasswordPlaceholder: "Confirm Password",
        errorPasswordsDoNotMatch: "Passwords do not match",
        forgotPassword: "Forgot password?",
        recoverTitle: "Password Recovery",
        recoverStep1Desc: "Enter your username and one of your recovery tokens.",
        recoverStep2Desc: "Set a new password for your account.",
        tokenPlaceholder: "Recovery Token",
        verifyButton: "Verify Token",
        resetButton: "Reset Password",
        backToLogin: "Back to Login",
        passwordResetSuccess: "Password successfully changed! Please log in."
      },
      profile: {
          title: "Edit Profile",
          passwordMismatch: "New passwords do not match!",
          currentPasswordRequired: "Current password is required to set a new one.",
          updateError: "Failed to update profile",
          save: "Save Changes",
          confirmPasswordPlaceholder: "Repeat New Password",
          currentPasswordPlaceholder: "Current Password",
          newPasswordPlaceholder: "New Password",
          recoveryTokensTitle: "Recovery Tokens",
          showTokens: "Show Tokens",
          enterPasswordToShow: "Enter password to view tokens",
          viewTokens: "View",
          copyToken: "Copy"
      },
      errors: {
        "Username already exists": "Username is already taken.",
        "Email already exists": "This email address is already in use.",
        "Invalid credentials": "Invalid username or password.",
        "Signature has expired": "Your session has expired. Please log in again.",
        "network_error": "No connection to server. Check your internet.",
        "unknown_error": "An unexpected error occurred.",
        "User not found": "User not found.",
        "No recovery tokens found": "User has no recovery tokens.",
        "Invalid recovery token": "Invalid recovery token.",
        "Invalid or expired reset token": "Password reset session expired.",
        "Invalid password": "Invalid password."
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
