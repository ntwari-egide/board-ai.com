import React from 'react';

interface WelcomeMessageProps {
  userName?: string;
}

/**
 * Welcome message component displayed in the center of the chat area
 */
export default function WelcomeMessage({ userName = 'Winter Aconite' }: WelcomeMessageProps) {
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
      <p className='mb-1.5 font-urbanist text-[10px] text-gray-500'>{currentDate}</p>

      {/* Greeting */}
      <h1 className='mb-1.5 font-urbanist text-lg font-medium leading-tight text-gray-900'>
        Hi {userName}! What do you have in mind today?
      </h1>

      {/* Description */}
      <p className='max-w-xl font-urbanist text-[13px] leading-snug text-gray-500'>
        I can help you with a consensus-driven strategy for modern product teams. A Collaborative AI Boardroom. Stress-testing product ideas with specialized autonomous agents.
      </p>
    </div>
  );
}
