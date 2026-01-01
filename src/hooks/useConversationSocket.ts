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

    // Connect to WebSocket
    const socket = socketService.connect();

    // Join conversation room
    socketService.joinConversation(conversationId);

    // Listen for agent typing
    socketService.onAgentTyping((data) => {
      if (data.conversationId === conversationId) {
        dispatch(addTypingAgent({
          agentType: data.agentType,
          agentName: data.agentName,
        }));
      }
    });

    // Listen for agent responses
    socketService.onAgentResponse((data) => {
      if (data.conversationId === conversationId) {
        // Remove typing indicator for this agent
        dispatch(removeTypingAgent(data.message.agentType || ''));
        
        // Add the message
        dispatch(addMessage(data.message));
      }
    });

    // Listen for round completed
    socketService.onRoundCompleted((data) => {
      if (data.conversationId === conversationId) {
        console.log(`Round ${data.roundNumber} completed`);
      }
    });

    // Listen for status changes
    socketService.onStatusChange((data) => {
      if (data.conversationId === conversationId && currentConversation) {
        dispatch(setCurrentConversation({
          ...currentConversation,
          status: data.status,
        }));
      }
    });

    // Cleanup on unmount
    return () => {
      if (conversationId) {
        socketService.leaveConversation(conversationId);
      }
      socketService.off('agent_typing');
      socketService.off('agent_response');
      socketService.off('round_completed');
      socketService.off('status_change');
    };
  }, [conversationId, dispatch, currentConversation]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, []);

  return { disconnect };
};

export default useConversationSocket;
