'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getCurrentUser } from '@/store/slices/authSlice';
import { fetchPersonas } from '@/store/slices/personaSlice';

import Sidebar from './Sidebar';
import TopBar from './TopBar';
import WelcomeMessage from './WelcomeMessage';
import ChatInput from './ChatInput';
import ConversationView from './ConversationView';

interface BoardLayoutProps {
  userName?: string;
  userAvatar?: string;
  children?: ReactNode;
}

/**
 * Main layout component for the Board application
 * Contains sidebar, top bar, and main content area
 */
export default function BoardLayout({
  userName,
  userAvatar,
  children,
}: BoardLayoutProps) {
  const dispatch = useAppDispatch();
  const { currentConversation, messages } = useAppSelector((state) => state.conversation);
  const { user } = useAppSelector((state) => state.auth);
  
  const [hasStartedConversation, setHasStartedConversation] = useState(false);

  // Initialize backend data (optional - works without auth)
  useEffect(() => {
    // Only call /auth/me when a token exists; otherwise stay in guest mode
    if (typeof window !== 'undefined') {
      const token = Cookies.get('auth_token') || localStorage.getItem('auth_token');
      if (token) {
        dispatch(getCurrentUser()).catch(() => {
          // Silently handle - app works without auth
        });
      }
    }

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

  const displayName = userName || (user ? `${user.firstName} ${user.lastName}` : undefined);

  const handleSendMessage = (message: string, files: File[]) => {
    setHasStartedConversation(true);
    // Backend integration handles message sending through ChatInput
  };

  return (
    <div className='flex h-screen overflow-hidden bg-gray-50'>
      {/* Sidebar - Hidden on mobile */}
      <div className='hidden md:block'>
        <Sidebar userName={displayName} userAvatar={userAvatar} />
      </div>

      {/* Main Content */}
      <div className='flex flex-1 flex-col'>
        {/* Top Bar */}
        <TopBar />

        {/* Content Area */}
        <main className='relative flex flex-1 flex-col overflow-hidden'>
          {/* Main Content */}
          <div className='relative flex flex-1 flex-col overflow-hidden'>
            {/* Page Title - Sticky Header - Hidden on mobile */}
            <div className='sticky top-0 z-10 hidden border-b border-gray-200/50 bg-white/70 px-6 py-3 backdrop-blur-xl md:block'>
              <h2 className='font-urbanist text-sm font-medium text-gray-900'>
                New brainstorming
              </h2>
            </div>
            {hasStartedConversation ? (
              <>
                <ConversationView onSendMessage={handleSendMessage} />
                {/* Fixed Input at Bottom */}
                <div className='bg-gradient-to-t from-gray-50 via-gray-50 to-transparent px-4 pb-4 pt-6 md:px-6 md:pb-6 md:pt-8'>
                  <div className='mx-auto max-w-3xl'>
                    <ChatInput onSendMessage={handleSendMessage} isCompact={true} />
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
