'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { BsPlus } from 'react-icons/bs';
import { IoArrowUp, IoSparkles, IoClose } from 'react-icons/io5';
import { SiOpenai } from 'react-icons/si';
import { AiOutlineFile } from 'react-icons/ai';

interface ChatInputProps {
  onSendMessage?: (message: string, files: File[]) => void;
  isCompact?: boolean;
}

/**
 * Chat input component with file upload and animation features
 */
export default function ChatInput({ onSendMessage, isCompact = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(isCompact);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && files.length === 0) return;

    // Trigger animation - move input to bottom
    setIsSubmitted(true);

    // Call parent callback if provided
    if (onSendMessage) {
      onSendMessage(message, files);
    }

    // Reset input fields but keep submitted state
    setTimeout(() => {
      setMessage('');
      setFiles([]);
      // Keep isSubmitted as true to maintain the compact layout
    }, 500);
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        layout
        className='w-full'
        style={{ position: 'relative' }}
        initial={false}
        animate={{
          maxWidth: isSubmitted ? '900px' : '800px',
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
          className={`flex flex-col rounded-[20px] border bg-white px-3.5 shadow-sm transition-colors duration-300 ease-in-out focus-within:border-[#C7E7EB] ${
            isDragging
              ? 'border-[#C7E7EB] bg-blue-50'
              : 'border-gray-300'
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
            <IoSparkles className='h-4 w-4 text-gray-400' />
            <input
              type='text'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Ask anything...'
              className='w-full border-none bg-transparent font-urbanist text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0'
            />
          </m.div>

          {/* Bottom Actions */}
          <div className='flex items-center justify-between'>
            {/* Left Actions */}
            <div className='flex items-center gap-1.5'>
              {/* Add Attachment Button */}
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                className='flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200'
                aria-label='Add attachment'
              >
                <BsPlus className='h-5 w-5' />
              </button>

              {/* AI Model Button */}
              <button
                type='button'
                className='flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200'
                aria-label='Select AI model'
              >
                <SiOpenai className='h-4 w-4' />
              </button>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={!message.trim() && files.length === 0}
              className='flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white transition-all hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400'
              aria-label='Send message'
            >
              <IoArrowUp className='h-4 w-4' />
            </button>
          </div>
        </m.div>
      </form>

      {/* Footer Text */}
      {!isSubmitted && (
        <m.div
          layout
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='mt-3 text-center'
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
    </LazyMotion>
  );
}
