import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { HiOutlineChatBubbleLeftRight, HiOutlineUser } from 'react-icons/hi2';
import { IoTimeOutline } from 'react-icons/io5';
import { LuLogOut } from 'react-icons/lu';

import {
  getAllConversations,
  setCurrentConversationId as setStorageConversationId,
} from '@/lib/conversationStorage';

import { dummyPersonas } from '@/data/dummyData';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import {
  clearCurrentConversation,
  fetchConversations,
  setCurrentConversation,
} from '@/store/slices/conversationSlice';
import { fetchPersonas, togglePersona } from '@/store/slices/personaSlice';

import {
  Conversation as ApiConversation,
  Persona as ApiPersona,
} from '@/types/api';
import { Conversation } from '@/types/chat';

interface SidebarProps {
  userName?: string;
  userAvatar?: string;
  onNewChat?: () => void;
  currentConversationId?: string | null;
}

/**
 * Sidebar component with logo, search, and new chat button
 */
export default function Sidebar({
  userName,
  userAvatar,
  onNewChat,
  currentConversationId,
}: SidebarProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Redux state
  const { conversations: backendConversations } = useAppSelector(
    (state) => state.conversation
  );
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { personas: backendPersonas, selectedPersonas } = useAppSelector(
    (state) => state.persona
  );

  // Use backend personas if available, otherwise fallback to dummy data
  const displayPersonas =
    backendPersonas.length > 0
      ? backendPersonas
      : dummyPersonas.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.role,
          systemPrompt: '',
          color: p.color,
          icon: p.avatar,
          capabilities: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

  const loadConversations = useCallback(() => {
    const allConversations = getAllConversations();
    setConversations(allConversations);
  }, []);

  useEffect(() => {
    if (backendPersonas.length === 0) {
      dispatch(fetchPersonas()).catch(() => {
        // Use dummy personas as fallback
      });
    }

    const fetchOrFallback = async () => {
      try {
        await dispatch(fetchConversations({ limit: 50 })).unwrap();
      } catch {
        loadConversations();
      }
    };

    fetchOrFallback();
  }, [
    dispatch,
    backendPersonas.length,
    isAuthenticated,
    currentConversationId,
    loadConversations,
  ]);

  // Convert backend conversations to display format
  useEffect(() => {
    if (backendConversations && backendConversations.length > 0) {
      const converted: Conversation[] = backendConversations.map(
        (conv: ApiConversation) => ({
          id: conv.id,
          title: conv.title,
          messages: [],
          personas: conv.activePersonas || [],
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
        })
      );
      setConversations(converted);
    }
  }, [backendConversations]);

  const handleConversationClick = (conversationId: string) => {
    const conversation = backendConversations?.find(
      (c: ApiConversation) => c.id === conversationId
    );
    if (conversation) {
      dispatch(setCurrentConversation(conversation));
      if (typeof window !== 'undefined') {
        localStorage.setItem('last_conversation_id', conversationId);
      }
      router.push(`/board/${conversationId}`);
    } else {
      // Fallback to localStorage behavior
      setStorageConversationId(conversationId);
      window.location.reload();
    }
  };

  const handleNewChat = () => {
    dispatch(clearCurrentConversation());
    if (onNewChat) {
      onNewChat();
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    // Stay on current page - no redirect needed
    window.location.reload();
  };

  const handlePersonaToggle = (personaId: string) => {
    dispatch(togglePersona(personaId));
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <aside className='flex h-screen w-[180px] flex-col border-r border-gray-200 bg-white px-4 py-5'>
      {/* Logo Section */}
      <div className='mb-5'>
        <div className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-md bg-black'>
            <span className='font-urbanist text-base font-bold text-[#E8FF2B]'>
              B
            </span>
          </div>
          <span className='font-urbanist text-lg font-bold text-gray-900'>
            Board
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className='mb-4'>
        <div className='relative'>
          <BiSearch className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500' />
          <input
            type='text'
            placeholder='Search personas or cha...'
            className='w-full rounded-xl border-none bg-gray-100 py-1.5 pl-8 pr-2.5 font-urbanist text-xs text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0'
          />
        </div>
      </div>

      {/* New Chat Button */}
      <div className='mb-4'>
        <button
          onClick={handleNewChat}
          className='flex w-full items-center gap-2 py-1.5 font-urbanist text-sm font-medium text-gray-700 transition-colors hover:text-gray-900'
        >
          <HiOutlineChatBubbleLeftRight className='h-4 w-4' />
          <span>New Chat</span>
        </button>
      </div>

      {/* Persona Selection */}
      <div className='mb-4'>
        <div className='mb-2 px-1'>
          <span className='font-urbanist text-xs font-medium text-gray-600'>
            AI Personas
          </span>
        </div>
        <div className='space-y-1'>
          {displayPersonas.slice(0, 4).map((persona: ApiPersona) => {
            const isSelected = selectedPersonas.includes(persona.id);
            const dummyPersona = dummyPersonas.find(
              (p) => p.id === persona.id || p.name === persona.name
            );

            return (
              <button
                key={persona.id}
                onClick={() => handlePersonaToggle(persona.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-urbanist text-xs transition-colors ${
                  isSelected
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div
                  className='flex h-5 w-5 items-center justify-center rounded text-[10px] font-semibold'
                  style={{
                    backgroundColor: isSelected
                      ? dummyPersona?.color || persona.color || '#888'
                      : 'transparent',
                    color: isSelected
                      ? 'white'
                      : dummyPersona?.color || persona.color || '#888',
                  }}
                >
                  {dummyPersona?.avatar ||
                    persona.icon ||
                    persona.name.charAt(0)}
                </div>
                <span className='truncate'>{persona.name}</span>
              </button>
            );
          })}
        </div>
        {selectedPersonas.length > 0 && (
          <div className='mt-2 px-2 text-[10px] text-gray-500'>
            {selectedPersonas.length} persona
            {selectedPersonas.length > 1 ? 's' : ''} selected
          </div>
        )}
      </div>

      {/* History Section */}
      <div className='mb-4 flex-1 overflow-y-auto'>
        <div className='mb-2 flex items-center gap-1.5 px-1'>
          <IoTimeOutline className='h-3.5 w-3.5 text-gray-500' />
          <span className='font-urbanist text-xs font-medium text-gray-600'>
            History
          </span>
        </div>
        <div className='space-y-1'>
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleConversationClick(conv.id)}
              className={`w-full rounded-lg px-2 py-1.5 text-left font-urbanist text-xs transition-colors hover:bg-gray-100 ${
                currentConversationId === conv.id
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600'
              }`}
            >
              <div className='truncate'>{conv.title}</div>
              <div className='mt-0.5 text-[10px] text-gray-400'>
                {formatDate(new Date(conv.updatedAt))}
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <p className='px-2 py-3 text-center font-urbanist text-xs text-gray-400'>
              No conversations yet
            </p>
          )}
        </div>
      </div>

      {/* User Profile - Bottom */}
      <div className='mt-auto'>
        {userAvatar || userName || user ? (
          <div className='flex items-center gap-2'>
            <div className='h-8 w-8 overflow-hidden rounded-full border-2 border-[#E8FF2B] bg-gradient-to-br from-gray-100 to-gray-200'>
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName || user?.firstName || 'User'}
                  className='h-full w-full object-cover'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300'>
                  <HiOutlineUser className='h-4 w-4 text-gray-500' />
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className='text-gray-600 transition-colors hover:text-gray-900'
              aria-label='Sign out'
            >
              <LuLogOut className='h-4 w-4' />
            </button>
          </div>
        ) : (
          <div className='flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 font-urbanist text-xs font-medium text-gray-700'>
            <HiOutlineUser className='h-3.5 w-3.5' />
            <span>Guest Mode</span>
          </div>
        )}
      </div>
    </aside>
  );
}
