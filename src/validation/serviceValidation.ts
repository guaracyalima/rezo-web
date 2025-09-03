// Validation rules for atendimento forms
export const atendimentoValidationRules = {
  title: {
    required: 'Título do atendimento é obrigatório',
    minLength: {
      value: 3,
      message: 'Título deve ter pelo menos 3 caracteres'
    },
    maxLength: {
      value: 100,
      message: 'Título deve ter no máximo 100 caracteres'
    }
  },
  description: {
    required: 'Descrição do atendimento é obrigatória',
    minLength: {
      value: 10,
      message: 'Descrição deve ter pelo menos 10 caracteres'
    }
  },
  category: {
    required: 'Categoria do atendimento é obrigatória'
  },
  basePrice: {
    required: 'Preço do atendimento é obrigatório',
    min: {
      value: 0,
      message: 'Preço deve ser maior que zero'
    }
  },
  duration: {
    required: 'Duração do atendimento é obrigatória',
    min: {
      value: 15,
      message: 'Duração deve ser pelo menos 15 minutos'
    }
  }
};