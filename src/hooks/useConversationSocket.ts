import { useCallback, useEffect } from 'react';

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

  useEffect(() => {
    if (!conversationId) return;

    socketService.connect();
    socketService.joinConversation(conversationId);

    // Listen for agent typing (backend emits agent_typing)
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

    // Listen for complete agent messages (agent_response)
    socketService.onAgentMessage((data) => {
      if (!data) return;
      const personaId = data.agentType || data.personaId;
      if (!personaId) return;
      dispatch(removeTypingAgent(personaId));
      dispatch(clearStreamingChunk(personaId));
      const message: Message = {
        id: data.message?.id || data.id,
        conversation: data.message?.conversationId || data.conversationId,
        role: 'AGENT',
        content: data.message?.content || data.content,
        agentType: personaId,
        createdAt: data.message?.createdAt || data.createdAt,
        updatedAt: data.message?.createdAt || data.createdAt,
      } as any;
      dispatch(finalizeStreamingMessage({ personaId, message }));
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
