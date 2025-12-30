import React, { useState } from 'react';
import { BsPlus } from 'react-icons/bs';
import { IoArrowUp, IoSparkles } from 'react-icons/io5';
import { SiOpenai } from 'react-icons/si';

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
    <div className='w-full max-w-4xl'>
      <form onSubmit={handleSubmit} className='relative'>
        {/* Input Container */}
        <div className='flex flex-col rounded-[28px] border-2 border-[#C7E7EB] bg-white p-6 shadow-sm transition-all duration-300 ease-in-out'>
          {/* Text Input with Sparkle Icon */}
          <div className='mb-24 flex items-center gap-3'>
            <IoSparkles className='h-6 w-6 text-gray-400' />
            <input
              type='text'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Ask anything...'
              className='w-full border-none bg-transparent font-urbanist text-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0'
            />
          </div>

          {/* Bottom Actions */}
          <div className='flex items-center justify-between'>
            {/* Left Actions */}
            <div className='flex items-center gap-2'>
              {/* Add Attachment Button */}
              <button
                type='button'
                className='flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200'
                aria-label='Add attachment'
              >
                <BsPlus className='h-6 w-6' />
              </button>

              {/* AI Model Button */}
              <button
                type='button'
                className='flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200'
                aria-label='Select AI model'
              >
                <SiOpenai className='h-5 w-5' />
              </button>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={!message.trim()}
              className='flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white transition-all hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400'
              aria-label='Send message'
            >
              <IoArrowUp className='h-5 w-5' />
            </button>
          </div>
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
