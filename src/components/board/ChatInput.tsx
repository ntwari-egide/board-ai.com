import React, { useState } from 'react';
import { BsPlus } from 'react-icons/bs';
import { HiOutlineFaceSmile } from 'react-icons/hi2';
import { IoArrowUp } from 'react-icons/io5';

/**
 * Chat input component with attachment and emoji buttons
 */
export default function ChatInput() {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // TODO: Handle message submission
    console.log('Message:', message);
    setMessage('');
  };

  return (
    <div className='w-full max-w-3xl'>
      <form onSubmit={handleSubmit} className='relative'>
        {/* Input Container */}
        <div className='flex items-end gap-2 rounded-2xl border border-gray-300 bg-white px-4 py-3 shadow-sm transition-shadow focus-within:shadow-md'>
          {/* Left Actions */}
          <div className='flex items-center gap-1 pb-1'>
            {/* Add Attachment Button */}
            <button
              type='button'
              className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100'
              aria-label='Add attachment'
            >
              <BsPlus className='h-5 w-5' />
            </button>

            {/* Emoji Button */}
            <button
              type='button'
              className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100'
              aria-label='Add emoji'
            >
              <HiOutlineFaceSmile className='h-5 w-5' />
            </button>
          </div>

          {/* Text Input */}
          <div className='flex-1'>
            <input
              type='text'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Ask anything...'
              className='w-full resize-none border-none bg-transparent font-urbanist text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0'
            />
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={!message.trim()}
            className='flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white transition-all hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400'
            aria-label='Send message'
          >
            <IoArrowUp className='h-4 w-4' />
          </button>
        </div>
      </form>

      {/* Footer Text */}
      <div className='mt-4 text-center'>
        <p className='font-urbanist text-xs text-gray-500'>
          Board can make mistakes. Check important info, see{' '}
          <button className='underline hover:text-gray-700'>
            Cookies Preferences
          </button>
        </p>
      </div>
    </div>
  );
}
