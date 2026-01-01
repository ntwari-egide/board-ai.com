import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import socketService from '@/lib/socketService';
import {
  addMessage,
  addTypingAgent,
  removeTypingAgent,
  setCurrentConversation,
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

    // Connect directly to per-conversation namespace (/conversations/:id)
    socketService.connect(conversationId);

    // Listen for agent typing (backend.md format)
    socketService.onAgentTyping((data) => {
      if (data.isTyping) {
        dispatch(addTypingAgent({
          agentType: data.personaId,
          agentName: data.message || data.personaId,
        }));
      } else {
        dispatch(removeTypingAgent(data.personaId));
      }
    });

    // Listen for complete agent messages (backend.md format)
    socketService.onAgentMessage((data) => {
      // Remove typing indicator
      dispatch(removeTypingAgent(data.personaId));
      
      // Add the complete message
      const message: Message = {
        id: data.id,
        conversation: data.conversationId,
        role: 'AGENT',
        content: data.content,
        agentType: data.personaId,
        createdAt: data.createdAt,
        updatedAt: data.createdAt,
      };
      dispatch(addMessage(message));
    });

    // Listen for streaming chunks (optional - for real-time display)
    socketService.onAgentStream((data) => {
      // Handle streaming chunks if needed
      // Can be used to show partial messages as they're generated
      if (!data.isComplete) {
        dispatch(addTypingAgent({
          agentType: data.personaId,
          agentName: data.chunk,
        }));
      }
    });

    // Listen for session complete
    socketService.onSessionComplete((data) => {
      if (data.conversationId === conversationId) {
        console.log('Session completed:', data);
        // Update conversation with final results
        if (currentConversation) {
          dispatch(setCurrentConversation({
            ...currentConversation,
            status: 'COMPLETED',
          }));
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
      socketService.off('AGENT_TYPING');
      socketService.off('AGENT_MESSAGE');
      socketService.off('AGENT_STREAM');
      socketService.off('SESSION_COMPLETE');
      socketService.off('ERROR');
    };
  }, [conversationId, dispatch, currentConversation]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, []);

  return { disconnect };
};

export default useConversationSocket;
