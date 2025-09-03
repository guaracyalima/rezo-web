// API endpoints for atendimento management
// Handles HTTP requests to the atendimento backend services

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const atendimentoApi = {
  // Get all atendimentos
  getAtendimentos: async (filters?: any) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/atendimentos?${queryParams}`);
    if (!response.ok) {
      throw new Error('Erro ao carregar atendimentos');
    }
    return response.json();
  },

  // Get atendimento by ID
  getAtendimento: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/atendimentos/${id}`);
    if (!response.ok) {
      throw new Error('Erro ao carregar atendimento');
    }
    return response.json();
  },

  // Create new atendimento
  createAtendimento: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/atendimentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Erro ao criar atendimento');
    }
    return response.json();
  },

  // Update atendimento
  updateAtendimento: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/atendimentos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Erro ao atualizar atendimento');
    }
    return response.json();
  },

  // Delete atendimento
  deleteAtendimento: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/atendimentos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Erro ao excluir atendimento');
    }
    return response.json();
  }
};