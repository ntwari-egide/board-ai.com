import apiClient from '@/lib/apiClient';

import {
  ProcessMessageRequest,
  ProcessMessageResponse,
  SummaryResponse,
} from '@/types/api';

export const orchestrationService = {
  /**
   * Process user message and trigger all active AI personas
   */
  async processMessage(
    conversationId: string,
    data: ProcessMessageRequest
  ): Promise<ProcessMessageResponse> {
    const response = await apiClient.post<ProcessMessageResponse>(
      `/orchestration/conversations/${conversationId}/process`,
      data
    );
    return response.data;
  },

  /**
   * Generate discussion summary for a conversation
   */
  async generateSummary(conversationId: string): Promise<SummaryResponse> {
    const response = await apiClient.get<SummaryResponse>(
      `/orchestration/conversations/${conversationId}/summary`
    );
    return response.data;
  },
};

export default orchestrationService;
