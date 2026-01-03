'use client';

import React, { useEffect, useRef, useState } from 'react';

import useConversationSocket from '@/hooks/useConversationSocket';

import { dummyPersonas } from '@/data/dummyData';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMessages } from '@/store/slices/conversationSlice';
import { fetchPersonas } from '@/store/slices/personaSlice';

import ChatMessage from './ChatMessage';

import { Message as ApiMessage } from '@/types/api';
import { Message } from '@/types/chat';

interface ConversationViewProps {
  onSendMessage: (content: string, files: File[]) => void;
  conversationId?: string | null;
  onTitleChange?: (title: string) => void;
}

/**
 * Main conversation view component - displays messages only
 */
export default function ConversationView({
  onSendMessage,
  conversationId,
  onTitleChange,
}: ConversationViewProps) {
  const dispatch = useAppDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redux state
  const {
    messages: backendMessages,
    messagesLoading,
    currentConversation,
    typingAgents,
    streamingChunks,
  } = useAppSelector((state) => state.conversation);
  const { personas, selectedPersonas } = useAppSelector(
    (state) => state.persona
  );
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
      const convertedMessages: Message[] = backendMessages.map(
        (msg: ApiMessage) => {
          const isAgent = msg.role?.toUpperCase() === 'AGENT';
          return {
            id: msg.id,
            personaId: isAgent
              ? msg.agentType || msg.personaId || 'agent'
              : 'user',
            content: msg.content,
            timestamp: new Date(msg.createdAt),
          };
        }
      );
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

  const getPersonaData = (personaId: string) => {
    const normalizedId = personaId?.toLowerCase?.() || personaId;
    const dummyMatch = dummyPersonas.find(
      (p) => p.id.toLowerCase() === normalizedId
    );
    const storeMatch = personasList.find(
      (p) => p.id.toLowerCase() === normalizedId
    );

    const name = storeMatch?.name || dummyMatch?.name || personaId;
    const role = storeMatch?.description || dummyMatch?.role || '';
    const color = storeMatch?.color || dummyMatch?.color || '#888';
    const avatar =
      storeMatch?.name?.charAt(0) ||
      dummyMatch?.avatar ||
      personaId.charAt(0).toUpperCase();

    return {
      id: personaId,
      name,
      role,
      avatar,
      color,
    };
  };

  return (
    <div className='flex-1 overflow-y-auto bg-gray-50'>
      <div className='mx-auto max-w-3xl px-4 pb-3 pt-4 md:px-6 md:pb-4 md:pt-6'>
        {currentConversation?.currentSpeaker && (
          <div className='mb-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs text-gray-700 shadow-sm'>
            <span className='inline-flex h-2 w-2 rounded-full bg-emerald-500' />
            <span>
              Speaking:{' '}
              {personasList.find(
                (p) => p.id === currentConversation.currentSpeaker
              )?.name || currentConversation.currentSpeaker}
            </span>
            {typeof currentConversation.turnIndex === 'number' && (
              <span className='text-gray-400'>
                • Turn {currentConversation.turnIndex + 1}
              </span>
            )}
          </div>
        )}
        {messages.map((message) => {
          const normalizedId = message.personaId?.toLowerCase?.() || '';
          const isAllowed =
            normalizedId === 'user' || selectedPersonas.includes(normalizedId);
          if (!isAllowed) return null;

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
              : dummyPersonas.find(
                  (p) =>
                    p.id === message.personaId ||
                    p.id === message.personaId.toLowerCase()
                ) || personasList.find((p) => p.id === message.personaId)
              ? {
                  ...getPersonaData(message.personaId),
                }
              : {
                  id: message.personaId,
                  name: message.personaId,
                  role: '',
                  avatar: message.personaId.charAt(0).toUpperCase(),
                  color: '#888',
                };

          return (
            <ChatMessage key={message.id} message={message} persona={persona} />
          );
        })}

        {/* Show typing indicators */}
        {typingAgents.map((agent) => {
          const normalizedId = agent.agentType?.toLowerCase?.() || '';
          if (!selectedPersonas.includes(normalizedId)) return null;

          const persona = getPersonaData(agent.agentType);
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
