'use client';

import { useRouter } from 'next/router';
import React, { ReactNode, useEffect, useState } from 'react';
import { useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearCurrentConversation,
  fetchConversationById,
  fetchMessages,
  setCurrentConversation,
} from '@/store/slices/conversationSlice';
import { fetchPersonas } from '@/store/slices/personaSlice';

import ChatInput from './ChatInput';
import ConversationView from './ConversationView';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import WelcomeMessage from './WelcomeMessage';

interface BoardLayoutProps {
  userName?: string;
  userAvatar?: string;
  children?: ReactNode;
  conversationId?: string;
}

/**
 * Main layout component for the Board application
 * Contains sidebar, top bar, and main content area
 */
export default function BoardLayout({
  userName,
  userAvatar,
  children,
  conversationId,
}: BoardLayoutProps) {
  const dispatch = useAppDispatch();
  const { currentConversation, messages } = useAppSelector(
    (state) => state.conversation
  );
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = router.asPath || '';

  const routeConversationId = useMemo(() => {
    if (conversationId) return conversationId;
    const match = pathname.match(/\/board\/(.+)$/);
    return match ? match[1] : null;
  }, [pathname, conversationId]);

  const [hasStartedConversation, setHasStartedConversation] = useState(false);

  // Initialize backend data (optional - works without auth)
  useEffect(() => {
    // Load personas (works without auth if backend allows)
    dispatch(fetchPersonas()).catch(() => {
      // Use dummy personas as fallback
    });
  }, [dispatch]);

  // Update hasStartedConversation based on Redux state
  useEffect(() => {
    if (currentConversation || messages.length > 0) {
      setHasStartedConversation(true);
    }
  }, [currentConversation, messages]);

  // If URL has a conversation id, hydrate it from backend (DB) and its messages
  useEffect(() => {
    if (!routeConversationId) return;
    if (currentConversation?.id === routeConversationId) return;

    dispatch(fetchConversationById(routeConversationId))
      .unwrap()
      .then((conv) => {
        dispatch(setCurrentConversation(conv));
        dispatch(fetchMessages(conv.id));
        if (typeof window !== 'undefined') {
          localStorage.setItem('last_conversation_id', conv.id);
        }
      })
      .catch(() => {
        // If not found, fall back to new chat
        router.replace('/');
      });
  }, [routeConversationId, currentConversation?.id, dispatch, router]);

  const displayName =
    userName || (user ? `${user.firstName} ${user.lastName}` : undefined);
  const title = currentConversation?.title || 'New brainstorming';

  const handleSendMessage = (message: string, files: File[]) => {
    setHasStartedConversation(true);
    // Backend integration handles message sending through ChatInput
  };

  const handleNewChat = () => {
    dispatch(clearCurrentConversation());
    setHasStartedConversation(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('last_conversation_id');
    }
    // Always navigate to home to ensure fresh state; replace to avoid back button returning to old thread
    router.replace('/');
  };

  return (
    <div className='flex h-screen overflow-hidden bg-gray-50'>
      {/* Sidebar - Hidden on mobile */}
      <div className='hidden md:block'>
        <Sidebar
          onNewChat={handleNewChat}
        />
      </div>

      {/* Main Content */}
      <div className='flex flex-1 flex-col'>
        {/* Top Bar */}
        <TopBar onNewChat={handleNewChat} />

        {/* Content Area */}
        <main className='relative flex flex-1 flex-col overflow-hidden'>
          {/* Main Content */}
          <div className='relative flex flex-1 flex-col overflow-hidden'>
            {/* Page Title - Sticky Header - Hidden on mobile */}
            <div className='sticky top-0 z-10 hidden border-b border-gray-200/50 bg-white/70 px-6 py-3 backdrop-blur-xl md:block'>
              <h2 className='font-urbanist text-sm font-medium text-gray-900'>
                {title}
              </h2>
            </div>
            {hasStartedConversation ? (
              <>
                <ConversationView onSendMessage={handleSendMessage} />
                {/* Fixed Input at Bottom */}
                <div className='bg-gradient-to-t from-gray-50 via-gray-50 to-transparent px-4 pb-4 pt-6 md:px-6 md:pb-6 md:pt-8'>
                  <div className='mx-auto max-w-3xl'>
                    <ChatInput
                      onSendMessage={handleSendMessage}
                      isCompact={true}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className='flex flex-1 flex-col items-center justify-center bg-transparent px-4 py-6 md:px-6 md:py-8'>
                {children || (
                  <>
                    {/* Welcome Message */}
                    <div className='mb-4 md:mb-6'>
                      <WelcomeMessage userName={displayName} />
                    </div>

                    {/* Chat Input */}
                    <ChatInput onSendMessage={handleSendMessage} />
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
