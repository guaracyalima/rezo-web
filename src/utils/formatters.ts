// Utility functions for masks and validations

export const formatCPF = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 11); // Limita a 11 dígitos
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
  }
  // Formatação parcial durante digitação
  if (cleaned.length > 6) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
  } else if (cleaned.length > 3) {
    return cleaned.replace(/(\d{3})(\d{0,3})/, '$1.$2');
  }
  return cleaned;
};

export const formatCNPJ = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 14); // Limita a 14 dígitos
  const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}`;
  }
  // Formatação parcial durante digitação
  if (cleaned.length > 12) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
  } else if (cleaned.length > 8) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
  } else if (cleaned.length > 5) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
  } else if (cleaned.length > 2) {
    return cleaned.replace(/(\d{2})(\d{0,3})/, '$1.$2');
  }
  return cleaned;
};

export const formatPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 11); // Limita a 11 dígitos
  if (cleaned.length === 11) {
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
  } else if (cleaned.length === 10) {
    const match = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
  }
  // Formatação parcial durante digitação
  if (cleaned.length > 6) {
    return cleaned.replace(/(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3');
  } else if (cleaned.length > 2) {
    return cleaned.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  }
  return cleaned;
};

export const formatCEP = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 8); // Limita a 8 dígitos
  const match = cleaned.match(/^(\d{5})(\d{3})$/);
  if (match) {
    return `${match[1]}-${match[2]}`;
  }
  // Formatação parcial durante digitação
  if (cleaned.length > 5) {
    return cleaned.replace(/(\d{5})(\d{0,3})/, '$1-$2');
  }
  return cleaned;
};

export const formatDocument = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 11) {
    return formatCPF(value);
  } else {
    return formatCNPJ(value);
  }
};

export const removeMask = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const validateCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  
  // Check for repeated digits
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  // Validate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;
  
  if (digit1 !== parseInt(cleaned.charAt(9))) return false;
  
  // Validate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;
  
  return digit2 === parseInt(cleaned.charAt(10));
};

export const validateCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return false;
  
  // Check for repeated digits
  if (/^(\d)\1{13}$/.test(cleaned)) return false;
  
  // Validate first digit
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleaned.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  if (digit1 !== parseInt(cleaned.charAt(12))) return false;
  
  // Validate second digit
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleaned.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return digit2 === parseInt(cleaned.charAt(13));
};

export const validateDocument = (document: string): boolean => {
  const cleaned = document.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return validateCPF(document);
  } else if (cleaned.length === 14) {
    return validateCNPJ(document);
  }
  return false;
};

export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
};

export const validateCEP = (cep: string): boolean => {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8;
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 3;
};

// Brazilian states with name and abbreviation
export const brazilianStates = [
  { name: 'Acre', abbr: 'AC' },
  { name: 'Alagoas', abbr: 'AL' },
  { name: 'Amapá', abbr: 'AP' },
  { name: 'Amazonas', abbr: 'AM' },
  { name: 'Bahia', abbr: 'BA' },
  { name: 'Ceará', abbr: 'CE' },
  { name: 'Distrito Federal', abbr: 'DF' },
  { name: 'Espírito Santo', abbr: 'ES' },
  { name: 'Goiás', abbr: 'GO' },
  { name: 'Maranhão', abbr: 'MA' },
  { name: 'Mato Grosso', abbr: 'MT' },
  { name: 'Mato Grosso do Sul', abbr: 'MS' },
  { name: 'Minas Gerais', abbr: 'MG' },
  { name: 'Pará', abbr: 'PA' },
  { name: 'Paraíba', abbr: 'PB' },
  { name: 'Paraná', abbr: 'PR' },
  { name: 'Pernambuco', abbr: 'PE' },
  { name: 'Piauí', abbr: 'PI' },
  { name: 'Rio de Janeiro', abbr: 'RJ' },
  { name: 'Rio Grande do Norte', abbr: 'RN' },
  { name: 'Rio Grande do Sul', abbr: 'RS' },
  { name: 'Rondônia', abbr: 'RO' },
  { name: 'Roraima', abbr: 'RR' },
  { name: 'Santa Catarina', abbr: 'SC' },
  { name: 'São Paulo', abbr: 'SP' },
  { name: 'Sergipe', abbr: 'SE' },
  { name: 'Tocantins', abbr: 'TO' }
];

// ViaCEP API function
export const fetchAddressByCEP = async (cep: string) => {
  try {
    const cleanedCEP = cep.replace(/\D/g, '');
    if (cleanedCEP.length !== 8) return null;
    
    const response = await fetch(`https://viacep.com.br/ws/${cleanedCEP}/json/`);
    const data = await response.json();
    
    if (data.erro) return null;
    
    return {
      address: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || ''
    };
  } catch (error) {
    console.error('Error fetching address:', error);
    return null;
  }
};