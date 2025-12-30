import React, { ReactNode } from 'react';

import ChatInput from './ChatInput';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import WelcomeMessage from './WelcomeMessage';

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
  return (
    <div className='flex h-screen overflow-hidden bg-gray-50'>
      {/* Sidebar */}
      <Sidebar userName={userName} userAvatar={userAvatar} />

      {/* Main Content */}
      <div className='flex flex-1 flex-col'>
        {/* Top Bar */}
        <TopBar />

        {/* Content Area */}
        <main className='flex flex-1 flex-col overflow-y-auto'>
          {/* Page Title */}
          <div className='border-b border-gray-200 bg-white px-6 py-4'>
            <h2 className='font-urbanist text-base font-medium text-gray-900'>
              New brainstorming
            </h2>
          </div>

          {/* Main Content - Centered */}
          <div className='flex flex-1 flex-col items-center justify-center px-6 py-12'>
            {children || (
              <>
                {/* Welcome Message */}
                <div className='mb-12'>
                  <WelcomeMessage userName={userName} />
                </div>

                {/* Chat Input */}
                <ChatInput />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
