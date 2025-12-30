import React from 'react';
import { BiSearch } from 'react-icons/bi';
import { HiOutlineChatBubbleLeftRight, HiOutlineUser } from 'react-icons/hi2';
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
    <aside className='flex h-screen w-[180px] flex-col border-r border-gray-200 bg-white px-4 py-5'>
      {/* Logo Section */}
      <div className='mb-5'>
        <div className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-md bg-black'>
            <span className='font-urbanist text-base font-bold text-[#E8FF2B]'>B</span>
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
      <div>
        <button className='flex w-full items-center gap-2 py-1.5 font-urbanist text-sm font-medium text-gray-700 transition-colors hover:text-gray-900'>
          <HiOutlineChatBubbleLeftRight className='h-4 w-4' />
          <span>New Chat</span>
        </button>
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
