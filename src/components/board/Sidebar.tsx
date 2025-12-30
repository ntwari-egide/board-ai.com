import React from 'react';
import { BiSearch } from 'react-icons/bi';
import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';

interface SidebarProps {
  userName?: string;
  userAvatar?: string;
}

/**
 * Sidebar component with logo, search, and new chat button
 */
export default function Sidebar({ userName, userAvatar }: SidebarProps) {
  return (
    <aside className='flex h-screen w-[148px] flex-col border-r border-gray-200 bg-white'>
      {/* Logo Section */}
      <div className='px-4 py-5'>
        <div className='flex items-center gap-2'>
          <div className='flex h-6 w-6 items-center justify-center rounded bg-black'>
            <span className='font-urbanist text-sm font-bold text-white'>B</span>
          </div>
          <span className='font-urbanist text-base font-semibold text-gray-900'>
            Board
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className='px-3'>
        <div className='relative'>
          <BiSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            placeholder='Search personas or chat...'
            className='w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 font-urbanist text-xs text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:outline-none focus:ring-0'
          />
        </div>
      </div>

      {/* New Chat Button */}
      <div className='mt-4 px-3'>
        <button className='flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 font-urbanist text-sm text-gray-700 transition-colors hover:bg-gray-50'>
          <HiOutlineChatBubbleLeftRight className='h-4 w-4' />
          <span>New Chat</span>
        </button>
      </div>

      {/* User Profile - Bottom */}
      <div className='mt-auto p-4'>
        <div className='flex items-center gap-2'>
          <div className='h-9 w-9 overflow-hidden rounded-full bg-gray-200'>
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName || 'User'}
                className='h-full w-full object-cover'
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center bg-gray-300 font-urbanist text-sm font-semibold text-gray-600'>
                {userName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <button className='text-gray-400 hover:text-gray-600'>
            <svg
              width='16'
              height='16'
              viewBox='0 0 16 16'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M2 8h12M8 2v12'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
