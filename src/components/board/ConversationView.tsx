'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Message } from '@/types/chat';
import { dummyPersonas } from '@/data/dummyData';
import ChatMessage from './ChatMessage';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMessages } from '@/store/slices/conversationSlice';
import { fetchPersonas } from '@/store/slices/personaSlice';
import useConversationSocket from '@/hooks/useConversationSocket';
import { Message as ApiMessage } from '@/types/api';

interface ConversationViewProps {
  onSendMessage: (content: string, files: File[]) => void;
  conversationId?: string | null;
  onTitleChange?: (title: string) => void;
}

/**
 * Main conversation view component - displays messages only
 */
export default function ConversationView({ onSendMessage, conversationId, onTitleChange }: ConversationViewProps) {
  const dispatch = useAppDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Redux state
  const { messages: backendMessages, messagesLoading, currentConversation, typingAgents, streamingChunks } = useAppSelector(
    (state) => state.conversation
  );
  const { personas } = useAppSelector((state) => state.persona);
  const personasList = Array.isArray(personas) ? personas : [];
  const { user } = useAppSelector((state) => state.auth);
  
  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize WebSocket for real-time updates
  useConversationSocket(currentConversation?.id || null);

  // Load personas on mount
  useEffect(() => {
    if (personas.length === 0) {
      dispatch(fetchPersonas());
    }
  }, [dispatch, personas.length]);

  // Load conversation messages when conversationId changes
  useEffect(() => {
    if (conversationId || currentConversation?.id) {
      const idToLoad = conversationId || currentConversation?.id;
      if (idToLoad) {
        dispatch(fetchMessages(idToLoad));
      }
    }
  }, [conversationId, currentConversation?.id, dispatch]);

  // Convert backend messages to display format
  useEffect(() => {
    if (backendMessages && backendMessages.length > 0) {
      const convertedMessages: Message[] = backendMessages.map((msg: ApiMessage) => ({
        id: msg.id,
        personaId: msg.role === 'USER' ? 'user' : msg.agentType || msg.personaId || 'agent',
        content: msg.content,
        timestamp: new Date(msg.createdAt),
      }));
      setMessages(convertedMessages);
    }
  }, [backendMessages]);

  // Update title when conversation changes
  useEffect(() => {
    if (currentConversation?.title && onTitleChange) {
      onTitleChange(currentConversation.title);
    }
  }, [currentConversation?.title, onTitleChange]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingAgents]);

  return (
    <div className='flex-1 overflow-y-auto bg-gray-50'>
      <div className='mx-auto max-w-3xl px-4 pb-3 pt-4 md:px-6 md:pb-4 md:pt-6'>
        {currentConversation?.currentSpeaker && (
          <div className='mb-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs text-gray-700 shadow-sm'>
            <span className='inline-flex h-2 w-2 rounded-full bg-emerald-500' />
            <span>Speaking: {
              personasList.find((p) => p.id === currentConversation.currentSpeaker)?.name ||
              currentConversation.currentSpeaker
            }</span>
            {typeof currentConversation.turnIndex === 'number' && (
              <span className='text-gray-400'>• Turn {currentConversation.turnIndex + 1}</span>
            )}
          </div>
        )}
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
              : dummyPersonas.find((p) => p.id === message.personaId || p.id === message.personaId.toLowerCase()) ||
                personasList.find((p) => p.id === message.personaId) ? {
                  id: message.personaId,
                  name: personasList.find((p) => p.id === message.personaId)?.name || message.personaId,
                  role: personasList.find((p) => p.id === message.personaId)?.description || '',
                  avatar: personasList.find((p) => p.id === message.personaId)?.name?.charAt(0) || message.personaId.charAt(0).toUpperCase(),
                  color: personasList.find((p) => p.id === message.personaId)?.color || '#888',
                } : {
                  id: message.personaId,
                  name: message.personaId,
                  role: '',
                  avatar: message.personaId.charAt(0).toUpperCase(),
                  color: '#888',
                };

          return <ChatMessage key={message.id} message={message} persona={persona} />;
        })}
        
        {/* Show typing indicators */}
        {typingAgents.map((agent) => {
          const personaMatch = personasList.find((p) => p.id === agent.agentType);
          const persona = {
            id: agent.agentType,
            name: personaMatch?.name || agent.agentName || agent.agentType,
            role: '',
            avatar: personaMatch?.name?.charAt(0) || agent.agentType.charAt(0).toUpperCase(),
            color: personaMatch?.color || '#e5e7eb',
          };
          const content = streamingChunks[agent.agentType] || '•••';

          return (
            <ChatMessage
              key={`typing-${agent.agentType}`}
              message={{
                id: `typing-${agent.agentType}`,
                personaId: agent.agentType.toLowerCase(),
                content,
                timestamp: new Date(),
                isTyping: true,
              }}
              persona={persona}
            />
          );
        })}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
