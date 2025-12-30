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
    <aside className='flex h-screen w-[280px] flex-col border-r border-gray-200 bg-white px-6 py-8'>
      {/* Logo Section */}
      <div className='mb-8'>
        <div className='flex items-center gap-3'>
          <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-black'>
            <span className='font-urbanist text-2xl font-bold text-[#E8FF2B]'>B</span>
          </div>
          <span className='font-urbanist text-3xl font-bold text-gray-900'>
            Board
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className='mb-6'>
        <div className='relative'>
          <BiSearch className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500' />
          <input
            type='text'
            placeholder='Search personas or chat...'
            className='w-full rounded-[20px] border-none bg-gray-100 py-4 pl-12 pr-4 font-urbanist text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0'
          />
        </div>
      </div>

      {/* New Chat Button */}
      <div>
        <button className='flex w-full items-center gap-3 py-3 font-urbanist text-xl font-medium text-gray-700 transition-colors hover:text-gray-900'>
          <HiOutlineChatBubbleLeftRight className='h-7 w-7' />
          <span>New Chat</span>
        </button>
      </div>

      {/* User Profile - Bottom */}
      <div className='mt-auto'>
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10 overflow-hidden rounded-full bg-gray-200'>
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName || 'User'}
                className='h-full w-full object-cover'
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center bg-gray-300 font-urbanist text-base font-semibold text-gray-600'>
                {userName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <button className='text-gray-400 hover:text-gray-600'>
            <svg
              width='20'
              height='20'
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
