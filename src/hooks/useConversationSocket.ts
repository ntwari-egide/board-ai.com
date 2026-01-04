import { useCallback, useEffect, useRef } from 'react';

import socketService from '@/lib/socketService';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addTypingAgent,
  clearStreamingChunk,
  finalizeStreamingMessage,
  removeTypingAgent,
  setCurrentConversation,
  setStreamingChunk,
  upsertStreamingMessage,
} from '@/store/slices/conversationSlice';

import { Message } from '@/types/api';

/**
 * Custom hook for managing WebSocket connections for conversations
 */
export const useConversationSocket = (conversationId: string | null) => {
  const dispatch = useAppDispatch();
  const { currentConversation } = useAppSelector((state) => state.conversation);
  const seenMessagesRef = useRef<Set<string>>(new Set());
  // Queue ensures agent responses render one-by-one with a short pause
  const pendingMessagesRef = useRef<any[]>([]);
  const isProcessingRef = useRef(false);

  const processQueue = useCallback(() => {
    if (isProcessingRef.current) return;
    const next = pendingMessagesRef.current.shift();
    if (!next) return;
    isProcessingRef.current = true;

    const personaId = next.personaId;
    dispatch(removeTypingAgent(personaId));
    dispatch(clearStreamingChunk(personaId));
    dispatch(finalizeStreamingMessage({ personaId, message: next.message }));

    // Small stagger so multiple personas don’t appear at once
    setTimeout(() => {
      isProcessingRef.current = false;
      processQueue();
    }, 900);
  }, [dispatch]);

  useEffect(() => {
    if (!conversationId) return;

    // Reset per-conversation state to avoid bleeding messages across threads
    seenMessagesRef.current = new Set();
    pendingMessagesRef.current = [];
    isProcessingRef.current = false;

    socketService.connect();
    socketService.joinConversation(conversationId);

    const recordMessage = (data: any) => {
      const personaId = data.agentId || data.agentType || data.personaId;
      if (!personaId) return;

      const messageId = data.message?.id || data.id;
      if (messageId && seenMessagesRef.current.has(messageId)) return;
      const resolvedId = messageId || `temp-${personaId}-${Date.now()}`;
      seenMessagesRef.current.add(resolvedId);

      const message: Message = {
        id: resolvedId,
        conversation: data.message?.conversationId || data.conversationId,
        role: 'AGENT',
        content: data.message?.content || data.content,
        agentType: personaId,
        createdAt: data.message?.createdAt || data.createdAt || new Date().toISOString(),
        updatedAt: data.message?.createdAt || data.createdAt || new Date().toISOString(),
      } as any;

      pendingMessagesRef.current.push({ personaId, message });
      processQueue();
    };

    // Listen for agent typing (legacy agent_typing)
    socketService.onAgentTyping((data) => {
      const personaId = data.agentType || data.personaId;
      if (!personaId) return;
      if (data.isTyping === false) {
        dispatch(removeTypingAgent(personaId));
      } else {
        dispatch(
          addTypingAgent({
            agentType: personaId,
            agentName: data.message || personaId,
          })
        );
      }
    });

    // New event-driven flow
    socketService.onAgentTypingStart((data) => {
      const personaId = data.agentId || data.agentType || data.personaId;
      if (!personaId) return;
      dispatch(
        addTypingAgent({
          agentType: personaId,
          agentName: data.agentName || personaId,
        })
      );
    });

    socketService.onAgentTypingStop((data) => {
      const personaId = data.agentId || data.agentType || data.personaId;
      if (!personaId) return;
      dispatch(removeTypingAgent(personaId));
    });

    socketService.onAgentMessageReceived((data) => {
      if (!data) return;
      recordMessage(data);
    });

    // Legacy complete agent messages (agent_response)
    socketService.onAgentMessage((data) => {
      if (!data) return;
      recordMessage(data);
    });

    // Listen for streaming chunks
    socketService.onAgentStream((data) => {
      if (!data) return;
      const personaId = data.agentType || data.personaId;
      if (!personaId) return;
      if (!data.isComplete) {
        dispatch(
          addTypingAgent({
            agentType: personaId,
            agentName: personaId,
          })
        );
        dispatch(
          upsertStreamingMessage({ personaId, chunk: data.chunk || '' })
        );
        dispatch(
          setStreamingChunk({ agentType: personaId, chunk: data.chunk || '' })
        );
      } else {
        dispatch(removeTypingAgent(personaId));
        dispatch(clearStreamingChunk(personaId));
      }
    });

    // Listen for session complete
    socketService.onSessionComplete((data) => {
      if (data.conversationId === conversationId) {
        console.log('Session completed:', data);
        // Update conversation with final results
        if (currentConversation) {
          dispatch(
            setCurrentConversation({
              ...currentConversation,
              status: 'COMPLETED',
            })
          );
        }
      }
    });

    // Listen for errors
    socketService.onError((error) => {
      console.error('WebSocket error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (conversationId) {
        socketService.leaveConversation(conversationId);
      }
      socketService.off('agent_typing');
      socketService.off('agent_response');
      socketService.off('agent_message_received');
      socketService.off('agent_typing_start');
      socketService.off('agent_typing_stop');
      socketService.off('agent_stream');
      socketService.off('session_complete');
      socketService.off('ERROR');
    };
  }, [conversationId, dispatch, currentConversation]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, []);

  return { disconnect };
};

export default useConversationSocket;
