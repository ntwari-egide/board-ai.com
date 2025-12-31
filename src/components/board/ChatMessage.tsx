import React from 'react';
import { Message, Persona } from '@/types/chat';
import { AiOutlineFile } from 'react-icons/ai';

interface ChatMessageProps {
  message: Message;
  persona: Persona;
}

/**
 * Individual chat message component
 */
export default function ChatMessage({ message, persona }: ChatMessageProps) {
  const isUser = message.personaId === 'user';

  if (isUser) {
    // User message - right aligned with white bg and cyan border
    return (
      <div className='flex justify-end py-4'>
        <div className='max-w-[85%]'>
          <div className='rounded-2xl border border-[#C7E7EB] bg-white px-4 py-3 shadow-sm'>
            <p className='font-urbanist text-[15px] leading-relaxed text-gray-900'>
              {message.content}
            </p>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className='mt-3 flex flex-wrap gap-2'>
                {message.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className='flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2'
                  >
                    <AiOutlineFile className='h-4 w-4 text-gray-600' />
                    <span className='font-urbanist text-xs text-gray-700'>
                      {attachment.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Agent message - left aligned with avatar
  return (
    <div className='flex gap-3 py-4'>
      {/* Avatar */}
      <div
        className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium text-white'
        style={{ backgroundColor: persona.color }}
      >
        {persona.avatar}
      </div>

      {/* Message Content */}
      <div className='flex-1'>
        <div className='mb-1 flex items-center gap-2'>
          <span className='font-urbanist text-sm font-semibold text-gray-900'>
            {persona.name}
          </span>
          {message.isTyping && (
            <span className='font-urbanist text-xs text-gray-500'>
              is working on ideas...
            </span>
          )}
        </div>

        {/* Message Text */}
        {!message.isTyping && (
          <>
            <p className='font-urbanist text-[15px] leading-relaxed text-gray-700'>
              {message.content}
            </p>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className='mt-3 flex flex-wrap gap-2'>
                {message.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className='flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2'
                  >
                    <AiOutlineFile className='h-4 w-4 text-red-500' />
                    <span className='font-urbanist text-xs text-gray-700'>
                      {attachment.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Typing Indicator */}
        {message.isTyping && (
          <div className='flex items-center gap-1'>
            <div
              className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
              style={{ animationDelay: '0ms' }}
            />
            <div
              className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
              style={{ animationDelay: '150ms' }}
            />
            <div
              className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
              style={{ animationDelay: '300ms' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
