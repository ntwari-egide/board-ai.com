import apiClient from '@/lib/apiClient';
import { Attachment } from '@/types/api';

export const attachmentService = {
  /**
   * Upload file attachment
   */
  async uploadFile(file: File, messageId: string): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('messageId', messageId);

    const response = await apiClient.post<Attachment>('/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get attachment by ID
   */
  async getAttachment(id: string): Promise<Attachment> {
    const response = await apiClient.get<Attachment>(`/attachments/${id}`);
    return response.data;
  },
};

export default attachmentService;
