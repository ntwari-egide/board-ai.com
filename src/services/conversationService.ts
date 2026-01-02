import apiClient from '@/lib/apiClient';
import {
  Conversation,
  CreateConversationRequest,
  UpdateConversationRequest,
  PaginatedResponse,
} from '@/types/api';

export const conversationService = {
  /**
   * Create a new conversation
   */
  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    const response = await apiClient.post<Conversation>('/conversations', data);
    return response.data;
  },

  /**
   * Get all conversations for the current user
   */
  async getUserConversations(page = 1, limit = 20): Promise<PaginatedResponse<Conversation>> {
    const response = await apiClient.get<PaginatedResponse<Conversation>>(
      `/conversations?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Get single conversation by ID
   */
  async getConversationById(id: string): Promise<Conversation> {
    const response = await apiClient.get<Conversation>(`/conversations/${id}`);
    return response.data;
  },

  /**
   * Update conversation
   */
  async updateConversation(
    id: string,
    data: UpdateConversationRequest
  ): Promise<Conversation> {
    const response = await apiClient.patch<Conversation>(`/conversations/${id}`, data);
    return response.data;
  },

  /**
   * Advance the conversation by one agent turn
   */
  async stepConversation(id: string): Promise<{ speaker: string | null; message: any | null }> {
    const response = await apiClient.post(`/orchestration/conversations/${id}/step`);
    return response.data.data;
  },

  /**
   * Delete conversation
   */
  async deleteConversation(id: string): Promise<void> {
    await apiClient.delete(`/conversations/${id}`);
  },
};

export default conversationService;
