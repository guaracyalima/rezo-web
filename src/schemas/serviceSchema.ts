// Database schema for atendimentos collection
// Defines the structure and validation rules for atendimento documents

export const atendimentoSchema = {
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
    trim: true
  },
  shortDescription: {
    type: String,
    maxlength: 200,
    trim: true
  },
  description: {
    type: String,
    required: true,
    minlength: 10
  },
  category: {
    type: String,
    required: true,
    enum: [
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
    ]
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 15 // minimum 15 minutes
  },
  experienceLevel: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced', 'all'],
    default: 'all'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  isInPerson: {
    type: Boolean,
    default: false
  },
  allowBooking: {
    type: Boolean,
    default: true
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  maxParticipants: {
    type: Number,
    min: 1
  },
  images: [{
    type: String,
    trim: true
  }],
  houseId: {
    type: String,
    required: true
  },
  providerId: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  languages: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  whatToExpect: [{
    type: String,
    trim: true
  }],
  includedMaterials: [{
    type: String,
    trim: true
  }],
  location: {
    address: String,
    city: String,
    state: String,
    isFlexible: {
      type: Boolean,
      default: false
    }
  },
  cancellationPolicy: String,
  refundPolicy: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
};