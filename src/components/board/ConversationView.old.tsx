'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Message } from '@/types/chat';
import { dummyPersonas, getRandomResponse, getRandomPersonas } from '@/data/dummyData';
import ChatMessage from './ChatMessage';
import { 
  getConversationById, 
  updateConversation, 
  getCurrentConversationId,
  generateConversationTitle 
} from '@/lib/conversationStorage';

interface ConversationViewProps {
  onSendMessage: (content: string, files: File[]) => void;
  conversationId?: string | null;
  onTitleChange?: (title: string) => void;
}

// Initial dummy messages
const initialMessages: Message[] = [
  {
    id: 'msg-1',
    personaId: 'user',
    content: 'I want to build a high-end mobile app for architecture enthusiasts to share and critique building designs using augmented reality.',
    timestamp: new Date(),
  },
  {
    id: 'msg-2',
    personaId: 'marketing',
    content: "I've scanned current market trends for 2025. The 'Arch-Tech' niche is growing, but user retention is low in existing apps due to poor visualization tools. However, AR adoption in professional architecture is up by 42%. Retrieving data... Estimated Total Addressable Market: $2.4B. I suggest we pivot the value prop from 'Social Sharing' to 'Professional Critique' to capture higher-value users.",
    timestamp: new Date(),
  },
  {
    id: 'msg-3',
    personaId: 'pm',
    content: 'Agreed on the pivot. But a professional tool requires high stability. Developer, can we build an AR critique engine in a 4-month MVP window with a team of 3?',
    timestamp: new Date(),
  },
  {
    id: 'msg-4',
    personaId: 'developer',
    content: "A full AR engine with real-time shadows and occlusion? No. That's a 9-month roadmap. If we want to launch in 4 months, we should use a web-based AR framework or limit the initial release to static 3D model overlays with 'pinned' comments.",
    timestamp: new Date(),
    attachments: [
      {
        id: 'file-1',
        name: 'Document 1.pdf',
        type: 'application/pdf',
      },
    ],
  },
  {
    id: 'msg-5',
    personaId: 'user',
    content: 'How about QA?',
    timestamp: new Date(),
  },
  {
    id: 'msg-6',
    personaId: 'qa',
    content: "LIDAR-only requirement limits our market to iPhone Pro and high-end Android users. Marketing, how does that affect the revenue prediction? Also, Developer, how do we handle lighting variations for outdoor architecture? I'm seeing a major risk in 'Environmental Inconsistency' for the AR critique.",
    timestamp: new Date(),
    isTyping: true,
  },
];

/**
 * Main conversation view component - displays messages only
 */
export default function ConversationView({ onSendMessage, conversationId, onTitleChange }: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation from storage on mount or when conversationId changes
  useEffect(() => {
    const loadedConversationId = conversationId || getCurrentConversationId();
    if (loadedConversationId) {
      const conversation = getConversationById(loadedConversationId);
      if (conversation && conversation.messages.length > 0) {
        setMessages(conversation.messages);
        if (onTitleChange) {
          onTitleChange(conversation.title);
        }
      }
    }
  }, [conversationId]);

  // Save messages to storage whenever they change
  useEffect(() => {
    const currentId = conversationId || getCurrentConversationId();
    if (currentId && messages.length > 0) {
      updateConversation(currentId, messages);
      
      // Update title if needed
      const firstUserMessage = messages.find(m => m.personaId === 'user');
      if (firstUserMessage && onTitleChange) {
        const title = generateConversationTitle(firstUserMessage.content);
        onTitleChange(title);
      }
    }
  }, [messages, conversationId]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Expose method to add messages from parent
  useEffect(() => {
    (window as any).addConversationMessage = (content: string, files: File[], convId?: string) => {
      if (!content.trim() && files.length === 0) return;

      // Create user message
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        personaId: 'user',
        content,
        timestamp: new Date(),
        attachments: files.map((file, index) => ({
          id: `file-${Date.now()}-${index}`,
          name: file.name,
          type: file.type,
        })),
      };

      // Add user message
      setMessages((prev) => [...prev, userMessage]);

      // Simulate AI responses from random personas
      const respondingPersonas = getRandomPersonas(Math.floor(Math.random() * 2) + 1);

      respondingPersonas.forEach((persona, index) => {
        // Show typing indicator first
        const typingMessage: Message = {
          id: `typing-${persona.id}-${Date.now()}`,
          personaId: persona.id,
          content: '',
          timestamp: new Date(),
          isTyping: true,
        };

        setTimeout(() => {
          setMessages((prev) => [...prev, typingMessage]);

          // Replace typing indicator with actual message after delay
          setTimeout(() => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === typingMessage.id
                  ? {
                      ...msg,
                      id: `msg-${persona.id}-${Date.now()}`,
                      content: getRandomResponse(persona.id),
                      isTyping: false,
                    }
                  : msg
              )
            );
          }, 1500 + Math.random() * 1000);
        }, 800 + index * 500);
      });
    };

    // Expose reset method
    (window as any).resetConversation = () => {
      setMessages([]);
    };
  }, []);

  return (
    <div className='flex-1 overflow-y-auto bg-gray-50'>
      <div className='mx-auto max-w-3xl px-4 pb-3 pt-4 md:px-6 md:pb-4 md:pt-6'>
        {messages.map((message) => {
          // Find persona (or create user persona)
          const persona =
            message.personaId === 'user'
              ? {
                  id: 'user',
                  name: 'You',
                  role: 'User',
                  avatar: 'Y',
                  color: '#E8FF2B',
                }
              : dummyPersonas.find((p) => p.id === message.personaId) || dummyPersonas[0];

          return <ChatMessage key={message.id} message={message} persona={persona} />;
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
