import React from 'react';
import { BiSearch } from 'react-icons/bi';
import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import { LuLogOut } from 'react-icons/lu';

interface SidebarProps {
  userName?: string;
  userAvatar?: string;
}

/**
 * Sidebar component with logo, search, and new chat button
 */
export default function Sidebar({ userName, userAvatar }: SidebarProps) {
  return (
    <aside className='flex h-screen w-[240px] flex-col border-r border-gray-200 bg-white px-5 py-6'>
      {/* Logo Section */}
      <div className='mb-6'>
        <div className='flex items-center gap-2.5'>
          <div className='flex h-11 w-11 items-center justify-center rounded-lg bg-black'>
            <span className='font-urbanist text-xl font-bold text-[#E8FF2B]'>B</span>
          </div>
          <span className='font-urbanist text-2xl font-bold text-gray-900'>
            Board
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className='mb-5'>
        <div className='relative'>
          <BiSearch className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500' />
          <input
            type='text'
            placeholder='Search personas or chat...'
            className='w-full rounded-[18px] border-none bg-gray-100 py-2.5 pl-10 pr-3.5 font-urbanist text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0'
          />
        </div>
      </div>

      {/* New Chat Button */}
      <div>
        <button className='flex w-full items-center gap-2.5 py-2 font-urbanist text-base font-medium text-gray-700 transition-colors hover:text-gray-900'>
          <HiOutlineChatBubbleLeftRight className='h-5 w-5' />
          <span>New Chat</span>
        </button>
      </div>

      {/* User Profile - Bottom */}
      <div className='mt-auto'>
        <div className='flex flexx-row items-center justify-between'>
          <div className='h-14 w-14 overflow-hidden rounded-full border-[3px] border-[#E8FF2B] bg-gray-200'>
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName || 'User'}
                className='h-full w-full object-cover'
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center bg-gray-300 font-urbanist text-lg font-semibold text-gray-600'>
                {userName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <button 
            className='text-gray-600 transition-colors hover:text-gray-900'
            aria-label='Sign out'
          >
            <LuLogOut className='h-6 w-6' />
          </button>
        </div>
      </div>
    </aside>
  );
}
