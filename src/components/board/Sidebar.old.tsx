import React, { useEffect, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { HiOutlineChatBubbleLeftRight, HiOutlineUser } from 'react-icons/hi2';
import { IoTimeOutline } from 'react-icons/io5';
import { LuLogOut } from 'react-icons/lu';

import {
  getAllConversations,
  setCurrentConversationId as setStorageConversationId,
} from '@/lib/conversationStorage';

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
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    // Load conversations on mount
    loadConversations();
  }, [currentConversationId]);

  const loadConversations = () => {
    const allConversations = getAllConversations();
    setConversations(allConversations);
  };

  const handleConversationClick = (conversationId: string) => {
    setStorageConversationId(conversationId);
    // Reload the page to load the conversation
    window.location.reload();
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
          onClick={onNewChat}
          className='flex w-full items-center gap-2 py-1.5 font-urbanist text-sm font-medium text-gray-700 transition-colors hover:text-gray-900'
        >
          <HiOutlineChatBubbleLeftRight className='h-4 w-4' />
          <span>New Chat</span>
        </button>
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
        {userAvatar || userName ? (
          <div className='flex items-center gap-2'>
            <div className='h-8 w-8 overflow-hidden rounded-full border-2 border-[#E8FF2B] bg-gradient-to-br from-gray-100 to-gray-200'>
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName || 'User'}
                  className='h-full w-full object-cover'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300'>
                  <HiOutlineUser className='h-4 w-4 text-gray-500' />
                </div>
              )}
            </div>
            <button
              className='text-gray-600 transition-colors hover:text-gray-900'
              aria-label='Sign out'
            >
              <LuLogOut className='h-4 w-4' />
            </button>
          </div>
        ) : (
          <button className='flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 font-urbanist text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200'>
            <HiOutlineUser className='h-3.5 w-3.5' />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
}
