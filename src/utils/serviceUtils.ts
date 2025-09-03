// Utility functions for atendimento management
// Handles common atendimento-related operations

export const formatAtendimentoPrice = (price: number): string => {
  return price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

export const formatAtendimentoDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minutos`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }
  return `${hours}h ${remainingMinutes}min`;
};

export const getAtendimentoStatusLabel = (isActive: boolean): string => {
  return isActive ? 'Ativo' : 'Inativo';
};

export const getAtendimentoModalityLabel = (isOnline: boolean, isInPerson: boolean): string => {
  if (isOnline && isInPerson) {
    return 'Online e Presencial';
  }
  if (isOnline) {
    return 'Online';
  }
  if (isInPerson) {
    return 'Presencial';
  }
  return 'Não especificado';
};