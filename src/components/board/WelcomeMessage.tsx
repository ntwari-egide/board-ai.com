import React from 'react';

interface WelcomeMessageProps {
  userName?: string;
}

/**
 * Welcome message component displayed in the center of the chat area
 */
export default function WelcomeMessage({
  userName = 'Winter Aconite',
}: WelcomeMessageProps) {
  // Get current date formatted as "Tue 22 July 2025"
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className='flex flex-col items-center text-center'>
      {/* Date */}
      <p className='mb-1 font-urbanist text-[10px] text-gray-600 md:mb-1.5'>
        {currentDate}
      </p>

      {/* Greeting */}
      <h1 className='mb-1 px-4 font-urbanist text-base font-medium leading-tight text-gray-900 md:mb-1.5 md:text-lg'>
        I can help you with a consensus-driven strategy for modern product teams.
      </h1>

      {/* Description */}
      <p className='max-w-xl px-6 font-urbanist text-xs leading-snug text-gray-500 md:text-[13px]'>
        A Collaborative AI Boardroom: Stress-testing product ideas with specialized autonomous agents.
      </p>
    </div>
  );
}
