import React, { useRef, useEffect, useState } from 'react';
import { Send, Loader2, Bot, User, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import chatService from '../../../services/chatService';
import './ChatArea.css';

const CodeBlockWithCopy = ({ children, ...props }) => {
    const preRef = useRef(null);
    const [isCopied, setIsCopied] = useState(false);
    const { t } = useTranslation();

    const handleCopy = async () => {
        if (!preRef.current) return;
        
        try {
            await navigator.clipboard.writeText(preRef.current.innerText);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };

    return (
        <div className="code-block-wrapper">
            <div className="code-block-header">
                <button onClick={handleCopy} className="copy-code-btn">
                    {isCopied ? <Check size={14} /> : <Copy size={14} />}
                    {isCopied ? t('chat.copied') : t('chat.copy')}
                </button>
            </div>
            <pre ref={preRef} {...props}>
                {children}
            </pre>
        </div>
    );
};

const ChatArea = ({ messages, isLoading, activeChatId, onMessageSent }) => {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false); 
    const [tempUserMessage, setTempUserMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isSending, tempUserMessage]);

    const handleSend = async (e) => {
        e.preventDefault();
        const messageText = inputValue.trim();

        if (!messageText || isSending || !activeChatId) return;

        try {
            setIsSending(true);
            setTempUserMessage(messageText);
            setInputValue('');

            const data = await chatService.sendMessage(activeChatId, messageText);

            const fullMessageUpdate = {
                query: messageText,
                response: data.response,
                sources: data.sources || [],
                conversation_id: data.conversation_id,
                title: data.title
            };

            if (onMessageSent) {
                onMessageSent(fullMessageUpdate);
            }
        } catch (error) {
            console.error("Błąd wysyłania:", error);
            setInputValue(messageText);
            toast.error(t('chat.connectionError'));
        } finally {
            setIsSending(false);
            setTempUserMessage('');
        }
    };

    if (!activeChatId) {
        return (
            <main className="main-chat-area welcome-view">
                <div className="welcome-content">
                    <h1>{t('chat.welcome')}</h1>
                    <p>{t('chat.selectChat')}</p>
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
                                    <div className="bubble bot-bubble">
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]} 
                                            rehypePlugins={[rehypeHighlight]}
                                            components={{ pre: CodeBlockWithCopy }}
                                        >
                                            {msg.response}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isSending && tempUserMessage && (
                            <div className="message-wrapper">
                                <div className="message user-message">
                                    <div className="avatar user-avatar"><User size={16} /></div>
                                    <div className="bubble user-bubble">{tempUserMessage}</div>
                                </div>
                                <div className="message bot-message typing-indicator">
                                    <div className="avatar bot-avatar"><Bot size={16} /></div>
                                    <div className="bubble bot-bubble">
                                        <Loader2 className="spinner-small" size={14} /> {t('chat.thinking')}
                                    </div>
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
                        placeholder={isSending ? t('chat.botReplying') : t('chat.typeMessage')}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isSending}
                    >
                        {isSending ? <Loader2 className="button-spinner" size={20} /> : <Send size={20} />}
                    </button>
                </div>
                <div className="powered-by">
                    {t('chat.poweredBy')}
                </div>
            </form>
        </main>
    );
};

export default ChatArea;