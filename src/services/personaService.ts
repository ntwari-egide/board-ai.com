import apiClient from '@/lib/apiClient';

import { Persona } from '@/types/api';

export const personaService = {
  /**
   * Get all personas
   */
  async getAllPersonas(): Promise<Persona[]> {
    const response = await apiClient.get<Persona[]>('/personas');
    return response.data;
  },

  /**
   * Get single persona by ID
   */
  async getPersonaById(id: string): Promise<Persona> {
    const response = await apiClient.get<Persona>(`/personas/${id}`);
    return response.data;
  },
};

export default personaService;
