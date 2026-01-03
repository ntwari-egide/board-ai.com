import apiClient from '@/lib/apiClient';

import { CreateMessageRequest, Message } from '@/types/api';

export const messageService = {
  /**
   * Get all messages in a conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await apiClient.get<Message[]>(
      `/conversations/${conversationId}/messages`
    );
    return response.data;
  },

  /**
   * Create a new message in a conversation
   */
  async createMessage(
    conversationId: string,
    data: CreateMessageRequest
  ): Promise<Message> {
    const response = await apiClient.post<Message>(
      `/conversations/${conversationId}/messages`,
      data
    );
    return response.data;
  },
};

export default messageService;
