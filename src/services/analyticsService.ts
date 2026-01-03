import apiClient from '@/lib/apiClient';

import { ConversationAnalytics } from '@/types/api';

export const analyticsService = {
  /**
   * Get conversation analytics
   */
  async getConversationAnalytics(
    conversationId: string
  ): Promise<ConversationAnalytics> {
    const response = await apiClient.get<ConversationAnalytics>(
      `/analytics/conversations/${conversationId}`
    );
    return response.data;
  },
};

export default analyticsService;
