import React from 'react';
import { BiSearch } from 'react-icons/bi';
import { HiOutlineUserGroup } from 'react-icons/hi2';
import { RiRobot2Line } from 'react-icons/ri';

/**
 * Top navigation bar with search and action buttons
 */
export default function TopBar() {
  return (
    <header className='flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6'>
      {/* Left side - empty for balance */}
      <div className='flex-1' />

      {/* Right side - Actions */}
      <div className='flex items-center gap-1.5'>
        {/* Search Button */}
        <button className='flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 font-urbanist text-[13px] text-gray-700 transition-all hover:bg-gray-50'>
          <BiSearch className='h-3.5 w-3.5' />
          <span>Search</span>
        </button>

        {/* Personas Button */}
        <button className='flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 font-urbanist text-[13px] text-gray-700 transition-all hover:bg-gray-50'>
          <HiOutlineUserGroup className='h-3.5 w-3.5' />
          <span>Personas</span>
        </button>

        {/* LLMs Button */}
        <button className='flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 font-urbanist text-[13px] text-gray-700 transition-all hover:bg-gray-50'>
          <RiRobot2Line className='h-3.5 w-3.5' />
          <span>LLMs</span>
        </button>
      </div>
    </header>
  );
}
