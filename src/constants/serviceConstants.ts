// Atendimento categories
export const ATENDIMENTO_CATEGORIES = [
  'Consulta Espiritual',
  'Leitura de Cartas',
  'Reiki',
  'Terapia Holística',
  'Meditação',
  'Aromaterapia',
  'Cristaloterapia',
  'Numerologia',
  'Astrologia',
  'Massagem Terapêutica',
  'Terapia com Florais',
  'Limpeza Espiritual',
  'Desenvolvimento Mediúnico',
  'Curso Online',
  'Workshop',
  'Mentoria',
  'Outro'
] as const;

export type AtendimentoCategory = typeof ATENDIMENTO_CATEGORIES[number];

// Atendimento experience levels
export const ATENDIMENTO_EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
  { value: 'all', label: 'Todos os níveis' }
] as const;

export type AtendimentoExperienceLevel = typeof ATENDIMENTO_EXPERIENCE_LEVELS[number]['value'];

// Atendimento status
export const ATENDIMENTO_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
  PENDING: 'pending'
} as const;

export type AtendimentoStatus = typeof ATENDIMENTO_STATUS[keyof typeof ATENDIMENTO_STATUS];