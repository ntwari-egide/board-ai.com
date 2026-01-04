'use client';

import { message as antMessage } from 'antd';
import { domAnimation, LazyMotion, m } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineFile } from 'react-icons/ai';
import { BsPlus } from 'react-icons/bs';
import { HiChevronDown } from 'react-icons/hi2';
import { IoArrowUp, IoClose, IoMicOutline, IoSparkles } from 'react-icons/io5';
import { SiOpenai } from 'react-icons/si';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addMessage,
  createConversation,
  fetchConversationById,
  fetchConversations,
  fetchMessages,
  processMessage,
  sendMessage,
  setCurrentConversation,
} from '@/store/slices/conversationSlice';
import { fetchPersonas } from '@/store/slices/personaSlice';

interface ChatInputProps {
  onSendMessage?: (message: string, files: File[]) => void;
  isCompact?: boolean;
}

/**
 * Chat input component with file upload and animation features
 */
export default function ChatInput({
  onSendMessage,
  isCompact = false,
}: ChatInputProps) {
  const dispatch = useAppDispatch();
  const { currentConversation } = useAppSelector((state) => state.conversation);
  const { selectedPersonas, personas } = useAppSelector(
    (state) => state.persona
  );

  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(isCompact);
  const [isDragging, setIsDragging] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ensure personas are loaded for tagging suggestions
  useEffect(() => {
    if (!personas?.length) {
      dispatch(fetchPersonas());
    }
  }, [dispatch, personas?.length]);

  // Hydrate last conversation if state was reset (e.g., hot reload)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Only hydrate an existing conversation when already on a conversation route
    if (!window.location.pathname.includes('/board/')) return;
    if (currentConversation) return;
    const lastId = localStorage.getItem('last_conversation_id');
    if (lastId) {
      dispatch(fetchConversationById(lastId))
        .unwrap()
        .then((conv: any) => dispatch(setCurrentConversation(conv)))
        .catch(() => {
          localStorage.removeItem('last_conversation_id');
        });
    }
  }, [dispatch, currentConversation]);

  // Handle file selection
  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newFiles = Array.from(selectedFiles);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  // Handle file removal
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle paste event for files
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        setFiles((prev) => [...prev, ...pastedFiles]);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const availablePersonas = React.useMemo(() => {
    const list = Array.isArray(personas) ? personas : [];
    if (selectedPersonas && selectedPersonas.length > 0) {
      return list.filter((p) => selectedPersonas.includes(p.id));
    }
    return list;
  }, [personas, selectedPersonas]);

  const updateMentionState = (value: string, cursor: number | null) => {
    const caret = cursor ?? value.length;
    const before = value.slice(0, caret);
    const match = /@([\w-]{0,50})$/.exec(before);
    if (match) {
      setMentionQuery(match[1]);
      setMentionOpen(true);
    } else {
      setMentionQuery('');
      setMentionOpen(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed && files.length === 0) return;

    // Check if personas are selected for new conversations
    if (!currentConversation && selectedPersonas.length === 0) {
      antMessage.warning(
        'Please select at least one AI persona from the sidebar'
      );
      return;
    }

    // Trigger animation - move input to bottom
    setIsSubmitted(true);

    // Optimistic user message so it appears immediately
    const userMessageContent = trimmed;
    const tempMessageId = `temp-${Date.now()}`;
    if (userMessageContent) {
      dispatch(
        addMessage({
          id: tempMessageId,
          role: 'USER',
          content: userMessageContent,
          personaId: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any)
      );
    }

    // Clear the input immediately and show sending state
    setMessage('');
    setIsSending(true);

    // Call parent callback if provided (for UI updates)
    if (onSendMessage) {
      onSendMessage(userMessageContent, files);
    }

    try {
      let conversationId = currentConversation?.id;

      // Create new conversation if needed
      if (!conversationId) {
        const conversation = await dispatch(
          createConversation({
            title: userMessageContent.slice(0, 50) || 'New Conversation',
            activePersonas: selectedPersonas,
            maxRounds: 3,
          })
        ).unwrap();
        conversationId = conversation.id;
        if (typeof window !== 'undefined') {
          localStorage.setItem('last_conversation_id', conversationId);
        }
      }

      // Persist the user message first so it appears in history
      await dispatch(
        sendMessage({
          conversationId,
          content: userMessageContent,
        })
      ).unwrap();

      // Process the message (triggers all AI personas)
      await dispatch(
        processMessage({
          conversationId,
          message: userMessageContent,
        })
      ).unwrap();

      // Refresh conversation list so history shows the new/updated thread
      dispatch(fetchConversations({ limit: 50 }));
      // Refresh messages to replace the optimistic user message with server data
      dispatch(fetchMessages(conversationId));

      // Reset input fields but keep submitted state
      setTimeout(() => {
        setFiles([]);
      }, 500);
    } catch (error) {
      // If backend fails, show error but don't block the UI
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Backend unavailable - using local mode';
      antMessage.info('Working in offline mode');
      console.warn('Backend error:', errorMessage);
      // Restore text so user can retry
      setMessage(trimmed);
    }
    setIsSending(false);
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        layout
        className='w-full px-0'
        style={{ position: 'relative' }}
        initial={false}
        animate={{
          maxWidth: isSubmitted ? '1180px' : '1080px',
        }}
        transition={{
          duration: 0.4,
          ease: 'easeInOut',
        }}
      >
        <form onSubmit={handleSubmit} className='relative'>
          {/* File Upload Input (hidden) */}
          <input
            ref={fileInputRef}
            type='file'
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className='hidden'
          />

          {/* Selected Files Display */}
          {files.length > 0 && (
            <div className='mb-3 flex flex-wrap gap-2'>
              {files.map((file, index) => (
                <div
                  key={index}
                  className='flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2'
                >
                  <AiOutlineFile className='h-4 w-4 text-gray-600' />
                  <span className='font-urbanist text-xs text-gray-700'>
                    {file.name}
                  </span>
                  <button
                    type='button'
                    onClick={() => removeFile(index)}
                    className='text-gray-400 hover:text-gray-600'
                  >
                    <IoClose className='h-4 w-4' />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Container with Drag & Drop */}
          <m.div
            layout
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            animate={{
              paddingTop: isSubmitted ? '0.375rem' : '0.875rem',
              paddingBottom: isSubmitted ? '0.375rem' : '0.875rem',
            }}
            transition={{
              duration: 0.4,
              ease: 'easeInOut',
            }}
            className={`flex flex-col rounded-2xl border bg-white px-3 shadow-sm transition-colors duration-300 ease-in-out focus-within:border-[#C7E7EB] md:rounded-[20px] md:px-3.5 ${
              isDragging ? 'border-[#C7E7EB] bg-blue-50' : 'border-gray-300'
            }`}
          >
            {/* Text Input with Sparkle Icon */}
            <m.div
              layout
              animate={{
                marginBottom: isSubmitted ? '0.5rem' : '3rem',
              }}
              transition={{
                duration: 0.4,
                ease: 'easeInOut',
              }}
              className='flex items-center gap-2'
            >
              <IoSparkles className='h-4 w-4 flex-shrink-0 text-gray-400' />
              <input
                type='text'
                ref={inputRef}
                value={message}
                onChange={(e) => {
                  const next = e.target.value;
                  setMessage(next);
                  updateMentionState(next, e.target.selectionStart);
                }}
                disabled={isSending}
                placeholder='Ask your AI team...'
                className='w-full border-none bg-transparent font-urbanist text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 md:text-[15px]'
              />
            </m.div>

            {/* Bottom Actions */}
            <div className='flex items-center justify-between'>
              {/* Left Actions */}
              <div className='flex items-center gap-1'>
                {/* Add Attachment Button */}
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className='flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 md:h-9 md:w-9'
                  aria-label='Add attachment'
                >
                  <BsPlus className='h-5 w-5' />
                </button>

                {/* AI Model Button */}
                <button
                  type='button'
                  className='flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 md:h-9 md:w-9'
                  aria-label='Select AI model'
                >
                  <SiOpenai className='h-4 w-4' />
                </button>
              </div>

              {/* Submit Button */}
              <div className='flex items-center gap-2'>
                <button
                  type='submit'
                  disabled={
                    isSending || (!message.trim() && files.length === 0)
                  }
                  className='flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white transition-all hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 md:h-9 md:w-9'
                  aria-label='Send message'
                >
                  {isSending ? (
                    <span className='h-4 w-4 animate-pulse'>…</span>
                  ) : (
                    <IoArrowUp className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>
          </m.div>
        </form>

        {/* Mobile Bottom Bar - Active agents and voice */}
        {isSubmitted && (
          <div className='mt-3 flex items-center justify-between md:hidden'>
            <div className='flex items-center gap-2'>
              {/* Avatar Stack */}
              <div className='flex items-center -space-x-2'>
                <div className='h-6 w-6 rounded-full bg-[#10B981] flex items-center justify-center text-white text-xs font-medium ring-2 ring-white'>
                  S
                </div>
                <div className='h-6 w-6 rounded-full bg-[#F59E0B] flex items-center justify-center text-white text-xs font-medium ring-2 ring-white'>
                  D
                </div>
                <div className='h-6 w-6 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white text-xs font-medium ring-2 ring-white'>
                  W
                </div>
              </div>

              {/* Active agents dropdown */}
              <button className='flex items-center gap-1 font-urbanist text-xs text-gray-600'>
                <span>Active all agents</span>
                <HiChevronDown className='h-3.5 w-3.5' />
              </button>
            </div>

            <div className='flex items-center gap-2'>
              {/* Voice button */}
              <button className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100'>
                <IoMicOutline className='h-5 w-5' />
              </button>

              {/* Add button */}
              <button className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100'>
                <BsPlus className='h-5 w-5' />
              </button>
            </div>
          </div>
        )}

        {/* Footer Text - Hidden on mobile */}
        {!isSubmitted && (
          <m.div
            layout
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='mt-3 hidden text-center md:block'
          >
            <p className='font-urbanist text-[11px] text-gray-500'>
              Board can make mistakes. Check important info, see{' '}
              <button className='underline hover:text-gray-700'>
                Cookies Preferences
              </button>
            </p>
          </m.div>
        )}
      </m.div>

      {mentionOpen && availablePersonas.length > 0 && (
        <div className='relative'>
          <div className='absolute z-20 mt-2 w-full max-w-[320px] rounded-xl border border-gray-200 bg-white shadow-lg'>
            <div className='max-h-64 overflow-auto p-2'>
              {availablePersonas
                .filter((p) =>
                  mentionQuery
                    ? `${p.id} ${p.name}`
                        .toLowerCase()
                        .includes(mentionQuery.toLowerCase())
                    : true
                )
                .map((p) => (
                  <button
                    key={p.id}
                    type='button'
                    className='flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left hover:bg-gray-50'
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const caret =
                        inputRef.current?.selectionStart ?? message.length;
                      const before = message.slice(0, caret);
                      const after = message.slice(caret);
                      const replaced = before.replace(
                        /@([\w-]{0,50})$/,
                        `@${p.id} `
                      );
                      const next = `${replaced}${after}`;
                      setMessage(next);
                      setMentionOpen(false);
                      setMentionQuery('');
                      // Move cursor to after inserted mention
                      requestAnimationFrame(() => {
                        const pos = replaced.length;
                        if (inputRef.current) {
                          inputRef.current.focus();
                          inputRef.current.setSelectionRange(pos, pos);
                        }
                      });
                    }}
                  >
                    <span className='font-semibold text-gray-900'>@{p.id}</span>
                    <span className='text-sm text-gray-600'>{p.name}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </LazyMotion>
  );
}
