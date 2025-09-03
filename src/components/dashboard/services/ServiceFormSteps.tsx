'use client';

import React, { useState, useEffect } from 'react';
import { Service, CreateServiceData, createService, updateService, uploadServiceImage, getServiceCategories } from '../../../services/servicesService';
import { getHousesByOwner } from '../../../services/housesService';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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

  const steps = [
    { id: 1, title: 'Informações Básicas', icon: '📝' },
    { id: 2, title: 'Preço e Modalidade', icon: '💰' },
    { id: 3, title: 'Imagem e Detalhes', icon: '📸' },
    { id: 4, title: 'Configurações', icon: '⚙️' }
  ];

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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          showToast({ type: 'error', title: 'Título obrigatório', message: 'Por favor, preencha o título do serviço' });
          return false;
        }
        if (!formData.description.trim()) {
          showToast({ type: 'error', title: 'Descrição obrigatória', message: 'Por favor, preencha a descrição do serviço' });
          return false;
        }
        if (!formData.houseId) {
          showToast({ type: 'error', title: 'Casa obrigatória', message: 'Por favor, selecione uma casa para o serviço' });
          return false;
        }
        if (!formData.category) {
          showToast({ type: 'error', title: 'Categoria obrigatória', message: 'Por favor, selecione uma categoria' });
          return false;
        }
        if (formData.category === 'Outro' && !customCategory.trim()) {
          showToast({ type: 'error', title: 'Nova categoria obrigatória', message: 'Por favor, digite o nome da nova categoria' });
          return false;
        }
        return true;
      
      case 2:
        if (formData.basePrice <= 0) {
          showToast({ type: 'error', title: 'Preço inválido', message: 'O preço deve ser maior que zero' });
          return false;
        }
        if (formData.duration <= 0) {
          showToast({ type: 'error', title: 'Duração inválida', message: 'A duração deve ser maior que zero' });
          return false;
        }
        if (!formData.isOnline && !formData.isInPerson) {
          showToast({ type: 'error', title: 'Modalidade obrigatória', message: 'Selecione pelo menos uma modalidade (online ou presencial)' });
          return false;
        }
        return true;
      
      case 3:
        if (!formData.images || formData.images.length === 0) {
          showToast({ type: 'error', title: 'Imagem obrigatória', message: 'Por favor, adicione uma imagem para o serviço' });
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      if (service?.id) {
        await updateService(service.id, formData);
      } else {
        await createService(formData);
      }
      onSave();
    } catch (error: any) {
      console.error('Error saving service:', error);
      showToast({
        type: 'error',
        title: 'Erro ao salvar serviço',
        message: error.message || 'Tente novamente'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]; // Only take the first image
    setUploadingImage(true);
    
    try {
      const tempServiceId = service?.id || 'temp_' + Date.now();
      const uploadedUrl = await uploadServiceImage(file, tempServiceId);
      
      setFormData(prev => ({
        ...prev,
        images: [uploadedUrl] // Replace existing image
      }));

      showToast({
        type: 'success',
        title: 'Imagem enviada',
        message: 'Imagem adicionada com sucesso'
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      showToast({
        type: 'error',
        title: 'Erro no upload',
        message: error.message || 'Erro ao enviar imagem'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      images: []
    }));
  };

  const addToList = (field: keyof Pick<CreateServiceData, 'tags' | 'requirements' | 'whatToExpect' | 'includedMaterials'>, value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !formData[field]?.includes(trimmedValue)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), trimmedValue]
      }));
    }
  };

  const removeFromList = (field: keyof Pick<CreateServiceData, 'tags' | 'requirements' | 'whatToExpect' | 'includedMaterials'>, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || []
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3 className="text-lg font-medium mb-4">
              Informações Básicas do Atendimento
            </h3>
            
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
                  disabled={!!houseId}
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
        );

      case 2:
        return (
          <div className="step-content">
            <h3 className="step-title">💰 Preço e Modalidade</h3>
            
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

            <div className="form-group">
              <label className="monday-label">Modalidade do Serviço *</label>
              <div className="checkbox-group spaced">
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
        );

      case 3:
        return (
          <div className="step-content">
            <h3 className="step-title">📸 Imagem e Detalhes</h3>
            
            <div className="form-group">
              <label className="monday-label">Imagem do Serviço *</label>
              <div className="image-upload-section">
                {formData.images.length > 0 ? (
                  <div className="image-preview">
                    <img src={formData.images[0]} alt="Serviço" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="remove-image"
                    >
                      ✕ Remover
                    </button>
                  </div>
                ) : (
                  <div className="upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                      id="service-image"
                      disabled={uploadingImage}
                    />
                    <label htmlFor="service-image" className="upload-label">
                      {uploadingImage ? '📤 Enviando...' : '📷 Adicionar Imagem *'}
                    </label>
                    <p className="upload-help">Recomendado: 500x300px, máximo 2MB</p>
                  </div>
                )}
              </div>
            </div>

            <ListInputGroup
              title="Tags"
              items={formData.tags || []}
              placeholder="Ex: tarot, espiritualidade, cura"
              onAdd={(value) => addToList('tags', value)}
              onRemove={(index) => removeFromList('tags', index)}
            />

            <ListInputGroup
              title="Pré-requisitos"
              items={formData.requirements || []}
              placeholder="Ex: Estar em jejum, trazer cristal pessoal"
              onAdd={(value) => addToList('requirements', value)}
              onRemove={(index) => removeFromList('requirements', index)}
            />

            <ListInputGroup
              title="O que esperar"
              items={formData.whatToExpect || []}
              placeholder="Ex: Orientação espiritual, limpeza energética"
              onAdd={(value) => addToList('whatToExpect', value)}
              onRemove={(index) => removeFromList('whatToExpect', index)}
            />

            <ListInputGroup
              title="Materiais inclusos"
              items={formData.includedMaterials || []}
              placeholder="Ex: Baralho de tarot, cristais, incenso"
              onAdd={(value) => addToList('includedMaterials', value)}
              onRemove={(index) => removeFromList('includedMaterials', index)}
            />
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h3 className="step-title">⚙️ Configurações</h3>
            
            <div className="form-group">
              <label className="monday-label">⚙️ Configurações</label>
              <div className="checkbox-group spaced">
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

            <div className="form-group">
              <label className="monday-label">Política de Cancelamento</label>
              <textarea
                value={formData.cancellationPolicy}
                onChange={(e) => setFormData(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
                placeholder="Descreva a política de cancelamento do serviço"
                className="monday-textarea"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="monday-label">Política de Reembolso</label>
              <textarea
                value={formData.refundPolicy}
                onChange={(e) => setFormData(prev => ({ ...prev, refundPolicy: e.target.value }))}
                placeholder="Descreva a política de reembolso do serviço"
                className="monday-textarea"
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="service-form">
      <div className="form-header">
        <h2 className="text-xl font-semibold mb-4">
          Criar Novo Atendimento
        </h2>
        <button onClick={onCancel} className="close-btn">✕</button>
      </div>

      {/* Progress Steps */}
      <div className="steps-indicator">
        <div className="steps-progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
        <div className="steps-container">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
              onClick={() => currentStep > step.id && setCurrentStep(step.id)}
            >
              <div className="step-circle">
                <div className="step-icon">
                  {currentStep > step.id ? '✓' : step.icon}
                </div>
              </div>
              <div className="step-info">
                {/* <div className="step-title">{step.title}</div> */}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-content">
        {renderStepContent()}
      </div>

      <div className="form-footer">
        <div className="footer-left">
          {currentStep > 1 && (
            <button onClick={prevStep} className="btn-secondary">
              ← Anterior
            </button>
          )}
        </div>
        
        <div className="footer-right">
          {currentStep < steps.length ? (
            <button onClick={nextStep} className="btn-monday">
              Próximo →
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className="btn-monday"
            >
              {loading ? 'Salvando...' : (service ? 'Atualizar' : 'Criar')} Serviço
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .service-form {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          margin: 0 auto;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          border-bottom: 1px solid #e1e5e9;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .form-header h2 {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .steps-indicator {
          padding: 32px 32px 24px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-bottom: 1px solid #e1e5e9;
          position: relative;
        }

        .steps-progress-bar {
          position: absolute;
          top: 50%;
          left: 32px;
          right: 32px;
          height: 2px;
          background: #e1e5e9;
          border-radius: 1px;
          transform: translateY(-1px);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0085ff, #00c875);
          border-radius: 1px;
          transition: width 0.3s ease;
        }

        .steps-container {
          display: flex;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          flex: 1;
          max-width: 200px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .step:hover {
          transform: translateY(-2px);
        }

        .step-circle {
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: white;
          border: 3px solid #e1e5e9;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .step.active .step-circle {
          border-color: #0085ff;
          background: #0085ff;
          box-shadow: 0 4px 16px rgba(0, 133, 255, 0.3);
        }

        .step.completed .step-circle {
          border-color: #00c875;
          background: #00c875;
          box-shadow: 0 4px 16px rgba(0, 200, 117, 0.3);
        }

        .step-icon {
          font-size: 24px;
          font-weight: 600;
          color: #676879;
          transition: all 0.2s ease;
        }

        .step.active .step-icon {
          color: white;
        }

        .step.completed .step-icon {
          color: white;
          font-size: 20px;
        }

        .step-info {
          text-align: center;
          background: white;
          padding: 8px 16px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          min-width: 120px;
        }

        .step.active .step-info {
          background: #0085ff;
          color: white;
        }

        .step.completed .step-info {
          background: #00c875;
          color: white;
        }

        .step-title {
          font-size: 14px;
          font-weight: 600;
          line-height: 1.2;
        }

        .form-content {
          padding: 32px;
          min-height: 400px;
          flex: 1;
          overflow-y: auto;
        }

        .step-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .step-title {
          font-size: 24px;
          font-weight: 600;
          color: #323338;
          margin: 0 0 24px 0;
          padding-bottom: 12px;
          border-bottom: 2px solid #0085ff;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
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
          margin-top: 8px;
        }

        .checkbox-group.spaced {
          gap: 16px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #323338;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .checkbox-label:hover {
          background: #f5f6f8;
        }

        .checkbox-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
        }

        .image-upload-section {
          border: 2px dashed #d0d4d9;
          border-radius: 8px;
          padding: 24px;
          text-align: center;
          background: #fafbfc;
        }

        .image-preview {
          position: relative;
          display: inline-block;
        }

        .image-preview img {
          width: 200px;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #e1e5e9;
        }

        .remove-image {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ff3333;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
          cursor: pointer;
        }

        .upload-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .file-input {
          display: none;
        }

        .upload-label {
          background: #0085ff;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .upload-label:hover {
          background: #0073e6;
        }

        .upload-help {
          font-size: 12px;
          color: #676879;
          margin: 0;
        }

        .form-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          border-top: 1px solid #e1e5e9;
          background: #f8f9fa;
        }

        .footer-left, .footer-right {
          display: flex;
          gap: 12px;
        }

        .btn-secondary {
          background: white;
          color: #676879;
          border: 1px solid #d0d4d9;
          padding: 12px 20px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: #f5f6f8;
          border-color: #323338;
          color: #323338;
        }

        .form-help {
          color: #676879;
          font-size: 12px;
        }

        .form-help.error {
          color: #ff3333;
        }

        @media (max-width: 768px) {
          .steps-indicator {
            padding: 24px 16px 20px;
          }

          .steps-container {
            flex-direction: column;
            gap: 16px;
          }

          .step {
            flex-direction: row;
            max-width: none;
            cursor: default;
          }

          .step:hover {
            transform: none;
          }

          .step-circle {
            width: 40px;
            height: 40px;
            flex-shrink: 0;
          }

          .step-icon {
            font-size: 16px;
          }

          .step-info {
            text-align: left;
            min-width: auto;
            flex: 1;
          }

          .steps-progress-bar {
            display: none;
          }

          .form-content {
            padding: 24px 16px;
          }

          .form-footer {
            padding: 16px;
            flex-direction: column;
            gap: 12px;
          }

          .footer-left, .footer-right {
            width: 100%;
            justify-content: center;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// Helper component for list inputs
const ListInputGroup: React.FC<{
  title: string;
  items: string[];
  placeholder: string;
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}> = ({ title, items, placeholder, onAdd, onRemove }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        onAdd(inputValue);
        setInputValue('');
      }
    }
  };

  return (
    <div className="form-group">
      <label className="monday-label">{title}</label>
      <div className="list-input-container">
        <div className="list-display">
          {items.map((item, index) => (
            <span key={index} className="list-item">
              {item}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="remove-list-btn"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="monday-input"
        />
      </div>
      <small className="form-help">Pressione Enter para adicionar</small>

      <style jsx>{`
        .list-input-container {
          border: 1px solid #d0d4d9;
          border-radius: 4px;
          padding: 8px;
          background: white;
        }

        .list-display {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 8px;
        }

        .list-item {
          background: #0085ff;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .remove-list-btn {
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

        .remove-list-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .list-input-container .monday-input {
          border: none;
          margin: 0;
          padding: 4px 0;
        }

        .list-input-container .monday-input:focus {
          box-shadow: none;
        }
      `}</style>
    </div>
  );
};

export default ServiceForm;