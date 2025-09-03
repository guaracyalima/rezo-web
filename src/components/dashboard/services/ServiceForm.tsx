'use client';

import React, { useState, useEffect } from 'react';
import { Service, CreateServiceData, createService, updateService, uploadServiceImage, getServiceCategories } from '../../../services/servicesService';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { getHousesByOwner } from '../../../services/housesService';
import { hasAvailabilityConfigured } from '../../../services/availabilityService';

interface ServiceFormProps {
  service?: Service | null;
  onSave: () => void;
  onCancel: () => void;
  houseId?: string;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  service,
  onSave,
  onCancel,
  houseId
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const [expectationInput, setExpectationInput] = useState('');
  const [materialInput, setMaterialInput] = useState('');
  const [availableHouses, setAvailableHouses] = useState<any[]>([]);
  const [customCategory, setCustomCategory] = useState('');

  const [formData, setFormData] = useState<CreateServiceData>({
    title: '',
    description: '',
    shortDescription: '',
    houseId: houseId || '',
    category: '',
    subcategory: '',
    basePrice: 0,
    duration: 60,
    experienceLevel: 'all',
    isOnline: false,
    isInPerson: true,
    maxParticipants: undefined,
    images: [],
    tags: [],
    requirements: [],
    whatToExpect: [],
    includedMaterials: [],
    availability: [],
    languages: ['Português'],
    location: {
      address: '',
      city: '',
      state: '',
      isFlexible: true
    },
    isFeatured: false,
    allowBooking: true,
    requiresApproval: false,
    cancellationPolicy: '',
    refundPolicy: '',
    metaTitle: '',
    metaDescription: '',
    seoSlug: ''
  });

  useEffect(() => {
    loadUserHouses();
  }, []);

  useEffect(() => {
    if (service) {
      console.log('ServiceForm: Loading service for edit:', service.id);
      const isCustomCategory = !getServiceCategories().includes(service.category);
      
      setFormData({
        title: service.title,
        description: service.description,
        shortDescription: service.shortDescription || '',
        houseId: service.houseId,
        category: isCustomCategory ? 'Outro' : service.category,
        subcategory: service.subcategory || '',
        basePrice: service.basePrice,
        duration: service.duration,
        experienceLevel: service.experienceLevel,
        isOnline: service.isOnline,
        isInPerson: service.isInPerson,
        maxParticipants: service.maxParticipants,
        images: service.images,
        tags: service.tags || [],
        requirements: service.requirements || [],
        whatToExpect: service.whatToExpect || [],
        includedMaterials: service.includedMaterials || [],
        availability: service.availability || [],
        languages: service.languages || ['Português'],
        location: service.location || {
          address: '',
          city: '',
          state: '',
          isFlexible: true
        },
        isFeatured: service.isFeatured,
        allowBooking: service.allowBooking,
        requiresApproval: service.requiresApproval,
        cancellationPolicy: service.cancellationPolicy || '',
        refundPolicy: service.refundPolicy || '',
        metaTitle: service.metaTitle || '',
        metaDescription: service.metaDescription || '',
        seoSlug: service.seoSlug || ''
      });

      if (isCustomCategory) {
        setCustomCategory(service.category);
      }
    } else {
      console.log('ServiceForm: Creating new service');
    }
  }, [service]);

  const loadUserHouses = async () => {
    try {
      if (user) {
        console.log('Loading houses for user:', user.uid);
        const userHouses = await getHousesByOwner(user.uid);
        console.log('User houses:', userHouses);
        
        setAvailableHouses(userHouses);
        
        // If no houseId is provided and user has houses, select the first one
        if (!houseId && userHouses.length > 0 && userHouses[0].id) {
          setFormData(prev => ({ ...prev, houseId: userHouses[0].id! }));
        }
      }
    } catch (error) {
      console.error('Error loading user houses:', error);
    }
  };

  const validateForm = async () => {
    if (!formData.title.trim()) {
      showToast({
        type: 'error',
        title: 'Título obrigatório',
        message: 'Por favor, preencha o título do atendimento'
      });
      return false;
    }

    if (!formData.description.trim()) {
      showToast({
        type: 'error',
        title: 'Descrição obrigatória',
        message: 'Por favor, preencha a descrição do atendimento'
      });
      return false;
    }

    if (!formData.houseId) {
      showToast({
        type: 'error',
        title: 'Casa obrigatória',
        message: 'Por favor, selecione uma casa para o serviço'
      });
      return false;
    }

    // Check availability configuration for new services that allow booking
    if (!service?.id && formData.allowBooking) {
      try {
        const hasConfig = await hasAvailabilityConfigured(formData.houseId);
        if (!hasConfig) {
          showToast({
            type: 'error',
            title: 'Horários não configurados',
            message: 'Configure os horários de atendimento da casa antes de criar atendimentos com agendamento'
          });
          return false;
        }
      } catch (error) {
        console.error('Error checking availability:', error);
        showToast({
          type: 'warning',
          title: 'Aviso',
          message: 'Não foi possível verificar a configuração de horários. Verifique se estão configurados.'
        });
      }
    }

    if (!formData.category) {
      showToast({
        type: 'error',
        title: 'Categoria obrigatória',
        message: 'Por favor, selecione uma categoria'
      });
      return false;
    }

    if (formData.category === 'Outro' && !customCategory.trim()) {
      showToast({
        type: 'error',
        title: 'Nova categoria obrigatória',
        message: 'Por favor, digite o nome da nova categoria'
      });
      return false;
    }

    if (formData.basePrice <= 0) {
      showToast({
        type: 'error',
        title: 'Preço inválido',
        message: 'O preço deve ser maior que zero'
      });
      return false;
    }

    if (formData.duration <= 0) {
      showToast({
        type: 'error',
        title: 'Duração inválida',
        message: 'A duração deve ser maior que zero'
      });
      return false;
    }

    if (!formData.isOnline && !formData.isInPerson) {
      showToast({
        type: 'error',
        title: 'Modalidade obrigatória',
        message: 'Selecione pelo menos uma modalidade (online ou presencial)'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    setLoading(true);
    try {
      if (service?.id) {
        // Update existing service
        console.log('Updating service:', service.id);
        await updateService(service.id, formData);
      } else {
        // Create new service
        console.log('Creating new service');
        await createService(formData);
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving service:', error);
      showToast({
        type: 'error',
        title: 'Erro ao salvar atendimento',
        message: error.message || 'Tente novamente'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Create a temporary service ID for upload (will be replaced when service is created)
        const tempServiceId = service?.id || 'temp_' + Date.now();
        return await uploadServiceImage(file, tempServiceId);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

      showToast({
        type: 'success',
        title: 'Imagens enviadas',
        message: `${uploadedUrls.length} imagem(ns) adicionada(s) com sucesso`
      });
    } catch (error: any) {
      console.error('Error uploading images:', error);
      showToast({
        type: 'error',
        title: 'Erro no upload',
        message: error.message || 'Erro ao enviar imagens'
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags?.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index) || []
    }));
  };

  const addRequirement = () => {
    const requirement = requirementInput.trim();
    if (requirement && !formData.requirements?.includes(requirement)) {
      setFormData(prev => ({
        ...prev,
        requirements: [...(prev.requirements || []), requirement]
      }));
      setRequirementInput('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements?.filter((_, i) => i !== index) || []
    }));
  };

  const addExpectation = () => {
    const expectation = expectationInput.trim();
    if (expectation && !formData.whatToExpect?.includes(expectation)) {
      setFormData(prev => ({
        ...prev,
        whatToExpect: [...(prev.whatToExpect || []), expectation]
      }));
      setExpectationInput('');
    }
  };

  const removeExpectation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      whatToExpect: prev.whatToExpect?.filter((_, i) => i !== index) || []
    }));
  };

  const addMaterial = () => {
    const material = materialInput.trim();
    if (material && !formData.includedMaterials?.includes(material)) {
      setFormData(prev => ({
        ...prev,
        includedMaterials: [...(prev.includedMaterials || []), material]
      }));
      setMaterialInput('');
    }
  };

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      includedMaterials: prev.includedMaterials?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="service-form">
      <div className="form-header">
        <h2>{service ? 'Editar Serviço' : 'Criar Novo Serviço'}</h2>
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancelar
          </button>
          <button 
            type="submit" 
            form="service-form"
            disabled={loading || uploadingImages}
            className="btn-monday"
          >
            {loading ? 'Salvando...' : (service ? 'Atualizar' : 'Criar')} Serviço
          </button>
        </div>
      </div>

      <form id="service-form" onSubmit={handleSubmit} className="form-content">
        {/* Basic Information */}
        <div className="form-section">
          <h3 className="section-title">Informações Básicas</h3>
          
          <div className="form-group">
            <label className="monday-label">Título do Serviço *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Consulta de Tarot, Sessão de Reiki, Limpeza Espiritual"
              className="monday-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="monday-label">Descrição Curta</label>
            <input
              type="text"
              value={formData.shortDescription || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
              placeholder="Uma breve descrição do seu serviço"
              className="monday-input"
              maxLength={150}
            />
          </div>

          <div className="form-group">
            <label className="monday-label">Descrição Completa *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva detalhadamente seu serviço, metodologia, benefícios e o que está incluído"
              className="monday-textarea"
              rows={6}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="monday-label">Casa *</label>
              <select
                value={formData.houseId}
                onChange={(e) => setFormData(prev => ({ ...prev, houseId: e.target.value }))}
                className="monday-select"
                required
                disabled={!!houseId} // Disable if houseId is provided as prop
              >
                <option value="">Selecione uma casa</option>
                {availableHouses.map((house) => (
                  <option key={house.id} value={house.id}>
                    {house.name}
                  </option>
                ))}
              </select>
              {availableHouses.length === 0 && (
                <small className="form-help error">
                  Nenhuma casa encontrada. Você precisa ser responsável por uma casa para criar serviços.
                </small>
              )}
              {houseId && (
                <small className="form-help">
                  Casa selecionada automaticamente para este contexto.
                </small>
              )}
            </div>

            <div className="form-group">
              <label className="monday-label">Categoria *</label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const selectedCategory = e.target.value;
                  setFormData(prev => ({ ...prev, category: selectedCategory }));
                  if (selectedCategory !== 'Outro') {
                    setCustomCategory('');
                  }
                }}
                className="monday-select"
                required
              >
                <option value="">Selecione uma categoria</option>
                {getServiceCategories().map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.category === 'Outro' && (
            <div className="form-group">
              <label className="monday-label">Nova Categoria *</label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomCategory(value);
                  setFormData(prev => ({ ...prev, category: value }));
                }}
                placeholder="Digite o nome da nova categoria"
                className="monday-input"
                required
              />
            </div>
          )}
        </div>

        {/* Pricing and Duration */}
        <div className="form-section">
          <h3 className="section-title">Preço e Duração</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="monday-label">Preço Base (R$) *</label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                placeholder="0,00"
                className="monday-input"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label className="monday-label">Duração (minutos) *</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                placeholder="60"
                className="monday-input"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="monday-label">Máximo de Participantes</label>
              <input
                type="number"
                value={formData.maxParticipants || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="Deixe vazio para ilimitado"
                className="monday-input"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Service Type */}
        <div className="form-section">
          <h3 className="section-title">Modalidade do Serviço</h3>
          
          <div className="form-group">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isOnline}
                  onChange={(e) => setFormData(prev => ({ ...prev, isOnline: e.target.checked }))}
                />
                💻 Online (videochamada, chat, etc.)
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isInPerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, isInPerson: e.target.checked }))}
                />
                🏠 Presencial (na casa ou local específico)
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="monday-label">Nível de Experiência</label>
            <select
              value={formData.experienceLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value as any }))}
              className="monday-select"
            >
              <option value="all">Todos os níveis</option>
              <option value="beginner">Iniciante</option>
              <option value="intermediate">Intermediário</option>
              <option value="advanced">Avançado</option>
            </select>
          </div>
        </div>

        {/* Images */}
        <div className="form-section">
          <h3 className="section-title">Imagens do Serviço</h3>
          
          <div className="form-group">
            <label className="monday-label">Adicionar Imagens</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="monday-input"
              disabled={uploadingImages}
            />
            {uploadingImages && <p className="upload-status">Enviando imagens...</p>}
          </div>

          {formData.images.length > 0 && (
            <div className="images-preview">
              {formData.images.map((image, index) => (
                <div key={index} className="image-preview">
                  <img src={image} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="remove-image"
                    title="Remover imagem"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="form-section">
          <h3 className="section-title">Tags e Categorização</h3>
          
          <div className="form-group">
            <label className="monday-label">Tags (pressione Enter para adicionar)</label>
            <div className="tags-input-container">
              <div className="tags-display">
                {formData.tags?.map((tag, index) => (
                  <span key={index} className="tag-item">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="remove-tag-btn"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Digite uma tag e pressione Enter"
                className="monday-input"
              />
            </div>
            <small className="form-help">
              Exemplo: tarot, espiritualidade, cura, energia
            </small>
          </div>
        </div>

        {/* Additional Information */}
        <div className="form-section">
          <h3 className="section-title">Informações Adicionais</h3>
          
          <div className="form-group">
            <label className="monday-label">Pré-requisitos (pressione Enter para adicionar)</label>
            <div className="list-input-container">
              <div className="list-display">
                {formData.requirements?.map((req, index) => (
                  <span key={index} className="list-item">
                    {req}
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="remove-list-btn"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRequirement();
                  }
                }}
                placeholder="Ex: Estar em jejum, trazer cristal pessoal"
                className="monday-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="monday-label">O que esperar (pressione Enter para adicionar)</label>
            <div className="list-input-container">
              <div className="list-display">
                {formData.whatToExpect?.map((exp, index) => (
                  <span key={index} className="list-item">
                    {exp}
                    <button
                      type="button"
                      onClick={() => removeExpectation(index)}
                      className="remove-list-btn"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={expectationInput}
                onChange={(e) => setExpectationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addExpectation();
                  }
                }}
                placeholder="Ex: Orientação espiritual, limpeza energética"
                className="monday-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="monday-label">Materiais inclusos (pressione Enter para adicionar)</label>
            <div className="list-input-container">
              <div className="list-display">
                {formData.includedMaterials?.map((mat, index) => (
                  <span key={index} className="list-item">
                    {mat}
                    <button
                      type="button"
                      onClick={() => removeMaterial(index)}
                      className="remove-list-btn"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={materialInput}
                onChange={(e) => setMaterialInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addMaterial();
                  }
                }}
                placeholder="Ex: Baralho de tarot, cristais, incenso"
                className="monday-input"
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="form-section">
          <h3 className="section-title">Configurações</h3>
          
          <div className="form-group">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                />
                ⭐ Serviço em destaque
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.allowBooking}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowBooking: e.target.checked }))}
                />
                📅 Permitir agendamentos
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.requiresApproval}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                />
                ✅ Requer aprovação prévia
              </label>
            </div>
          </div>
        </div>
      </form>

      <style jsx>{`
        .service-form {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e1e5e9;
          background: #fafbfc;
        }

        .form-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: #323338;
          margin: 0;
        }

        .form-actions {
          display: flex;
          gap: 12px;
        }

        .btn-cancel {
          background: white;
          color: #676879;
          border: 1px solid #d0d4d9;
          padding: 12px 20px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover {
          background: #f5f6f8;
        }

        .form-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          max-height: 70vh;
          overflow-y: auto;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #323338;
          margin: 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #0085ff;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #323338;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
        }

        .images-preview {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 8px;
          margin-top: 12px;
          max-width: 400px;
        }

        .image-preview {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 6px;
          overflow: hidden;
          border: 2px solid #e1e5e9;
          background: #f8f9fa;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-image {
          position: absolute;
          top: 2px;
          right: 2px;
          background: rgba(255, 51, 51, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          cursor: pointer;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .remove-image:hover {
          background: #ff3333;
          transform: scale(1.1);
        }

        .tags-input-container, .list-input-container {
          border: 1px solid #d0d4d9;
          border-radius: 4px;
          padding: 8px;
          background: white;
        }

        .tags-display, .list-display {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 8px;
        }

        .tag-item, .list-item {
          background: #0085ff;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .remove-tag-btn, .remove-list-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-tag-btn:hover, .remove-list-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .tags-input-container .monday-input, .list-input-container .monday-input {
          border: none;
          margin: 0;
          padding: 4px 0;
        }

        .tags-input-container .monday-input:focus, .list-input-container .monday-input:focus {
          box-shadow: none;
        }

        .form-help {
          color: #676879;
          font-size: 12px;
          margin-top: 4px;
        }

        .form-help.error {
          color: #ff3333;
        }

        .upload-status {
          color: #0085ff;
          font-size: 12px;
          margin-top: 4px;
        }

        @media (max-width: 768px) {
          .form-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .form-actions {
            justify-content: stretch;
          }

          .form-actions button {
            flex: 1;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceForm;