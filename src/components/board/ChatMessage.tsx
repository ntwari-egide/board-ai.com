import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
      <div className='flex justify-end py-3 md:py-4'>
        <div className='max-w-[90%] md:max-w-[85%]'>
          <div className='rounded-2xl border border-[#C7E7EB] bg-white px-3.5 py-2.5 shadow-sm md:px-4 md:py-3'>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className='markdown-render font-urbanist text-sm leading-relaxed text-gray-900 md:text-[15px]'
              components={{
                p: (props) => <p className='mb-2 last:mb-0' {...props} />,
                ul: (props) => <ul className='mb-2 list-disc space-y-1 pl-5' {...props} />,
                ol: (props) => <ol className='mb-2 list-decimal space-y-1 pl-5' {...props} />,
                li: (props) => <li className='leading-relaxed text-gray-900' {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className='mt-2 flex flex-wrap gap-2 md:mt-3'>
                {message.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className='flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 md:px-3 md:py-2'
                  >
                    <AiOutlineFile className='h-3.5 w-3.5 text-gray-600 md:h-4 md:w-4' />
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
    <div className='flex gap-2.5 py-3 md:gap-3 md:py-4'>
      {/* Avatar */}
      <div
        className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium text-white md:h-10 md:w-10 md:text-sm'
        style={{ backgroundColor: persona.color }}
      >
        {persona.avatar}
      </div>

      {/* Message Content */}
      <div className='flex-1'>
        <div className='mb-0.5 flex items-center gap-2 md:mb-1'>
          <span className='font-urbanist text-xs font-semibold text-gray-900 md:text-sm'>
            {persona.name}
          </span>
          {message.isTyping && (
            <span className='font-urbanist text-[11px] text-gray-500 md:text-xs'>
              is working on ideas...
            </span>
          )}
        </div>

        {/* Message Text */}
        {!message.isTyping && (
          <>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className='markdown-render font-urbanist text-sm leading-relaxed text-gray-700 md:text-[15px]'
              components={{
                p: (props) => <p className='mb-2 last:mb-0' {...props} />,
                ul: (props) => <ul className='mb-2 list-disc space-y-1 pl-5' {...props} />,
                ol: (props) => <ol className='mb-2 list-decimal space-y-1 pl-5' {...props} />,
                li: (props) => <li className='leading-relaxed text-gray-700' {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className='mt-2 flex flex-wrap gap-2 md:mt-3'>
                {message.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className='flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 md:px-3 md:py-2'
                  >
                    <AiOutlineFile className='h-3.5 w-3.5 text-red-500 md:h-4 md:w-4' />
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
