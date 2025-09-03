// Custom hook for managing atendimentos
// Provides CRUD operations and state management for atendimentos

import { useState, useEffect } from 'react';
import { Atendimento, CreateAtendimentoData, AtendimentoFilters } from '../types/service';
import { 
  getAtendimentos, 
  createAtendimento, 
  updateAtendimento, 
  deleteAtendimento 
} from '../services/servicesService';
import { useToast } from '../contexts/ToastContext';

export const useAtendimentos = (filters?: AtendimentoFilters) => {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadAtendimentos = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAtendimentos(filters);
      setAtendimentos(result.atendimentos);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar atendimentos');
      showToast({
        type: 'error',
        title: 'Erro ao carregar atendimentos',
        message: err.message || 'Tente novamente'
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewAtendimento = async (data: CreateAtendimentoData) => {
    try {
      const newAtendimento = await createAtendimento(data);
      setAtendimentos(prev => [newAtendimento, ...prev]);
      showToast({
        type: 'success',
        title: 'Atendimento criado',
        message: 'Atendimento criado com sucesso!'
      });
      return newAtendimento;
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Erro ao criar atendimento',
        message: err.message || 'Tente novamente'
      });
      throw err;
    }
  };

  const updateExistingAtendimento = async (id: string, data: Partial<CreateAtendimentoData>) => {
    try {
      const updatedAtendimento = await updateAtendimento(id, data);
      setAtendimentos(prev => prev.map(a => a.id === id ? updatedAtendimento : a));
      showToast({
        type: 'success',
        title: 'Atendimento atualizado',
        message: 'Atendimento atualizado com sucesso!'
      });
      return updatedAtendimento;
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Erro ao atualizar atendimento',
        message: err.message || 'Tente novamente'
      });
      throw err;
    }
  };

  const deleteExistingAtendimento = async (id: string) => {
    try {
      await deleteAtendimento(id);
      setAtendimentos(prev => prev.filter(a => a.id !== id));
      showToast({
        type: 'success',
        title: 'Atendimento excluído',
        message: 'Atendimento excluído com sucesso!'
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Erro ao excluir atendimento',
        message: err.message || 'Tente novamente'
      });
      throw err;
    }
  };

  useEffect(() => {
    loadAtendimentos();
  }, [filters]);

  return {
    atendimentos,
    loading,
    error,
    loadAtendimentos,
    createNewAtendimento,
    updateExistingAtendimento,
    deleteExistingAtendimento
  };
};