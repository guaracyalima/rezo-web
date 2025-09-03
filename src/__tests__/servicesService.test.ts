// Tests for atendimento service functions
// Ensures atendimento CRUD operations work correctly

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { 
  getAtendimentos, 
  createAtendimento, 
  updateAtendimento, 
  deleteAtendimento 
} from '../services/servicesService';
import { Atendimento, CreateAtendimentoData } from '../types/service';

describe('Atendimento Service', () => {
  let testAtendimento: Atendimento;
  let testData: CreateAtendimentoData;

  beforeEach(() => {
    testData = {
      title: 'Teste de Atendimento',
      description: 'Descrição de teste para atendimento',
      category: 'Consulta Espiritual',
      basePrice: 100,
      duration: 60,
      experienceLevel: 'beginner',
      isOnline: true,
      isInPerson: false,
      allowBooking: true,
      requiresApproval: false,
      isActive: true,
      isFeatured: false,
      images: [],
      houseId: 'test-house-id',
      providerId: 'test-provider-id'
    };
  });

  describe('createAtendimento', () => {
    it('should create a new atendimento', async () => {
      const result = await createAtendimento(testData);
      
      expect(result).toBeDefined();
      expect(result.title).toBe(testData.title);
      expect(result.description).toBe(testData.description);
      expect(result.category).toBe(testData.category);
      expect(result.basePrice).toBe(testData.basePrice);
      expect(result.duration).toBe(testData.duration);
      expect(result.isOnline).toBe(testData.isOnline);
      expect(result.isInPerson).toBe(testData.isInPerson);
      
      testAtendimento = result;
    });

    it('should throw error for invalid data', async () => {
      const invalidData = { ...testData, title: '' };
      
      await expect(createAtendimento(invalidData)).rejects.toThrow();
    });
  });

  describe('getAtendimentos', () => {
    it('should return array of atendimentos', async () => {
      const result = await getAtendimentos();
      
      expect(Array.isArray(result.atendimentos)).toBe(true);
      expect(result).toHaveProperty('total');
    });

    it('should filter atendimentos by category', async () => {
      const result = await getAtendimentos({ category: 'Consulta Espiritual' });
      
      expect(result.atendimentos.every(a => a.category === 'Consulta Espiritual')).toBe(true);
    });
  });

  describe('updateAtendimento', () => {
    it('should update an existing atendimento', async () => {
      const updateData = { title: 'Título Atualizado' };
      const result = await updateAtendimento(testAtendimento.id!, updateData);
      
      expect(result.title).toBe(updateData.title);
      expect(result.updatedAt).not.toBe(testAtendimento.updatedAt);
    });
  });

  describe('deleteAtendimento', () => {
    it('should delete an atendimento', async () => {
      await deleteAtendimento(testAtendimento.id!);
      
      const result = await getAtendimentos();
      expect(result.atendimentos.find(a => a.id === testAtendimento.id)).toBeUndefined();
    });
  });
});