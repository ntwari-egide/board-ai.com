import { Conversation, Message } from '@/types/chat';

const STORAGE_KEY = 'board_conversations';
const CURRENT_CONVERSATION_KEY = 'board_current_conversation';

/**
 * Save a conversation to localStorage
 */
export function saveConversation(conversation: Conversation): void {
  try {
    const conversations = getAllConversations();
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);
    
    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.unshift(conversation);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
}

/**
 * Get all conversations from localStorage
 */
export function getAllConversations(): Conversation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const conversations = JSON.parse(stored);
    // Convert date strings back to Date objects
    return conversations.map((conv: any) => ({
      ...conv,
      createdAt: new Date(conv.createdAt),
      updatedAt: new Date(conv.updatedAt),
      messages: conv.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }));
  } catch (error) {
    console.error('Error loading conversations:', error);
    return [];
  }
}

/**
 * Get a specific conversation by ID
 */
export function getConversationById(id: string): Conversation | null {
  const conversations = getAllConversations();
  return conversations.find(c => c.id === id) || null;
}

/**
 * Delete a conversation
 */
export function deleteConversation(id: string): void {
  try {
    const conversations = getAllConversations();
    const filtered = conversations.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting conversation:', error);
  }
}

/**
 * Set the current active conversation ID
 */
export function setCurrentConversationId(id: string | null): void {
  try {
    if (id === null) {
      localStorage.removeItem(CURRENT_CONVERSATION_KEY);
    } else {
      localStorage.setItem(CURRENT_CONVERSATION_KEY, id);
    }
  } catch (error) {
    console.error('Error setting current conversation:', error);
  }
}

/**
 * Get the current active conversation ID
 */
export function getCurrentConversationId(): string | null {
  try {
    return localStorage.getItem(CURRENT_CONVERSATION_KEY);
  } catch (error) {
    console.error('Error getting current conversation:', error);
    return null;
  }
}

/**
 * Generate a title from the first message
 */
export function generateConversationTitle(firstMessage: string): string {
  const maxLength = 50;
  if (firstMessage.length <= maxLength) {
    return firstMessage;
  }
  return firstMessage.substring(0, maxLength).trim() + '...';
}

/**
 * Create a new conversation
 */
export function createNewConversation(firstMessage?: Message): Conversation {
  const now = new Date();
  const conversation: Conversation = {
    id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: firstMessage 
      ? generateConversationTitle(firstMessage.content)
      : 'New brainstorming',
    messages: firstMessage ? [firstMessage] : [],
    createdAt: now,
    updatedAt: now,
  };
  
  return conversation;
}

/**
 * Update conversation with new messages
 */
export function updateConversation(
  conversationId: string,
  messages: Message[]
): void {
  const conversation = getConversationById(conversationId);
  if (conversation) {
    conversation.messages = messages;
    conversation.updatedAt = new Date();
    
    // Update title if it's still the default
    if (conversation.title === 'New brainstorming' && messages.length > 0) {
      const firstUserMessage = messages.find(m => m.personaId === 'user');
      if (firstUserMessage) {
        conversation.title = generateConversationTitle(firstUserMessage.content);
      }
    }
    
    saveConversation(conversation);
  }
}
