import React from 'react';
import { BiSearch } from 'react-icons/bi';
import { HiOutlineUserGroup, HiOutlinePencilSquare } from 'react-icons/hi2';
import { RiRobot2Line } from 'react-icons/ri';
import { HiMenuAlt2 } from 'react-icons/hi';

interface TopBarProps {
  title?: string;
  onNewChat?: () => void;
}

/**
 * Top navigation bar with search and action buttons
 */
export default function TopBar({ title = 'New brainstorming', onNewChat }: TopBarProps) {
  return (
    <header className='flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6'>
      {/* Left side - Menu icon on mobile, empty on desktop */}
      <div className='flex flex-1 items-center gap-3'>
        <button className='flex items-center text-gray-700 md:hidden'>
          <HiMenuAlt2 className='h-6 w-6' />
        </button>
        <h1 className='font-urbanist text-base font-semibold text-gray-900 md:hidden'>
          {title}
        </h1>
      </div>

      {/* Right side - Actions */}
      <div className='flex items-center gap-1.5'>
        {/* Edit Icon - Mobile only */}
        <button 
          onClick={onNewChat}
          className='flex items-center justify-center text-gray-700 md:hidden'
        >
          <HiOutlinePencilSquare className='h-5 w-5' />
        </button>

        {/* Search Button - Desktop only */}
        <button className='hidden items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 font-urbanist text-[13px] text-gray-700 transition-all hover:bg-gray-50 md:flex'>
          <BiSearch className='h-3.5 w-3.5' />
          <span>Search</span>
        </button>

        {/* Personas Button - Desktop only */}
        <button className='hidden items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 font-urbanist text-[13px] text-gray-700 transition-all hover:bg-gray-50 md:flex'>
          <HiOutlineUserGroup className='h-3.5 w-3.5' />
          <span>Personas</span>
        </button>

        {/* LLMs Button - Desktop only */}
        <button className='hidden items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 font-urbanist text-[13px] text-gray-700 transition-all hover:bg-gray-50 md:flex'>
          <RiRobot2Line className='h-3.5 w-3.5' />
          <span>LLMs</span>
        </button>
      </div>
    </header>
  );
}
