"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import Message from './Message';

interface MessageContextType {
  showMessage: (type: 'success' | 'error' | 'info', message: string) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

interface MessageItem {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageId, setMessageId] = useState(0);

  const showMessage = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = messageId;
    setMessageId(prev => prev + 1);
    setMessages(prev => [...prev, { id, type, message }]);
  }, [messageId]);

  const removeMessage = useCallback((id: number) => {
    setMessages(prev => prev.filter(message => message.id !== id));
  }, []);

  return (
    <MessageContext.Provider value={{ showMessage }}>
      {children}
      {messages.map(({ id, type, message }) => (
        <Message
          key={id}
          type={type}
          message={message}
          onClose={() => removeMessage(id)}
        />
      ))}
    </MessageContext.Provider>
  );
}; 