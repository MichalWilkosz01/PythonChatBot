import React, { useRef, useEffect, useState } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import chatService from '../../../services/chatService';
import './ChatArea.css';

const ChatArea = ({ messages, isLoading, activeChatId, onMessageSent }) => {
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false); // Lokalny stan wysyłania
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isSending]);

    const handleSend = async (e) => {
        e.preventDefault();
        const messageText = inputValue.trim();

        if (!messageText || isSending || !activeChatId) return;

        try {
            setIsSending(true);
            setInputValue('');

            // 1. Wysyłka do API
            const data = await chatService.sendMessage(activeChatId, messageText);

            // 2. Budujemy obiekt wiadomości pasujący do Twojego interfejsu
            // Łączymy wysłane zapytanie z otrzymaną odpowiedzią
            const fullMessageUpdate = {
                query: messageText,
                response: data.response,
                sources: data.sources || [],
                conversation_id: data.conversation_id
            };

            // 3. Przekazujemy kompletny obiekt do rodzica
            if (onMessageSent) {
                onMessageSent(fullMessageUpdate);
            }
        } catch (error) {
            console.error("Błąd wysyłania:", error);
            setInputValue(messageText);
            alert("Wystąpił problem z połączeniem.");
        } finally {
            setIsSending(false);
        }
    };

    if (!activeChatId) {
        return (
            <main className="main-chat-area welcome-view">
                <div className="welcome-content">
                    <h1>Witaj w SmartBot!</h1>
                    <p>Wybierz konwersację, aby rozpocząć.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="main-chat-area">
            <div className="messages-container">
                {isLoading && messages.length === 0 ? (
                    <div className="loading-view"><Loader2 className="spinner" /></div>
                ) : (
                    <>
                        {messages.map((msg, index) => (
                            <div key={index} className="message-wrapper">
                                <div className="message user-message">
                                    <div className="avatar user-avatar"><User size={16} /></div>
                                    <div className="bubble user-bubble">{msg.query}</div>
                                </div>
                                <div className="message bot-message">
                                    <div className="avatar bot-avatar"><Bot size={16} /></div>
                                    <div className="bubble bot-bubble">{msg.response}</div>
                                </div>
                            </div>
                        ))}
                        {/* Wskaźnik, że bot generuje odpowiedź */}
                        {isSending && (
                            <div className="message bot-message typing-indicator">
                                <div className="avatar bot-avatar"><Bot size={16} /></div>
                                <div className="bubble bot-bubble">
                                    <Loader2 className="spinner-small" size={14} /> Myślę...
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="input-area" onSubmit={handleSend}>
                <div className="input-wrapper">
                    <input
                        type="text"
                        placeholder={isSending ? "Bot odpowiada..." : "Napisz wiadomość..."}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isSending}
                    >
                        {isSending ? <Loader2 className="spinner" size={20} /> : <Send size={20} />}
                    </button>
                </div>
            </form>
        </main>
    );
};

export default ChatArea;