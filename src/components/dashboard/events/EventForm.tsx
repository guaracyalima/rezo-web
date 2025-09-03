'use client';

import React, { useState, useEffect } from 'react';
import { 
  Event, 
  CreateEventData, 
  createEvent, 
  updateEvent, 
  getEventCategories,
  uploadEventImage 
} from '../../../services/eventsService';
import { getHousesByOwner } from '../../../services/housesService';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';

interface EventFormProps {
  event?: Event | null;
  onSave: () => void;
  onCancel: () => void;
  houseId?: string;
}

const EventForm: React.FC<EventFormProps> = ({
  event,
  onSave,
  onCancel,
  houseId
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userHouses, setUserHouses] = useState<any[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    category: '',
    houseId: houseId || '',
    maxParticipants: '',
    
    // Location
    address: '',
    city: '',
    state: '',
    
    // Ticket info
    ticketType: 'free',
    ticketPrice: '',
    ticketDescription: '',
    
    // Contact
    phone: '',
    whatsapp: '',
    email: '',
    
    // Other
    requirements: '',
    isPublic: true
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Currency formatting
  const formatCurrency = (value: string): string => {
    // Remove all non-digits
    const numericValue = value.replace(/\D/g, '');
    
    if (!numericValue) return '';
    
    // Convert to number and format
    const numberValue = parseInt(numericValue) / 100;
    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const parseCurrency = (formattedValue: string): number => {
    const numericValue = formattedValue.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(numericValue) || 0;
  };

  const categories = getEventCategories();
  
  const brazilianStates = [
    { code: 'AC', name: 'Acre' },
    { code: 'AL', name: 'Alagoas' },
    { code: 'AP', name: 'Amapá' },
    { code: 'AM', name: 'Amazonas' },
    { code: 'BA', name: 'Bahia' },
    { code: 'CE', name: 'Ceará' },
    { code: 'DF', name: 'Distrito Federal' },
    { code: 'ES', name: 'Espírito Santo' },
    { code: 'GO', name: 'Goiás' },
    { code: 'MA', name: 'Maranhão' },
    { code: 'MT', name: 'Mato Grosso' },
    { code: 'MS', name: 'Mato Grosso do Sul' },
    { code: 'MG', name: 'Minas Gerais' },
    { code: 'PA', name: 'Pará' },
    { code: 'PB', name: 'Paraíba' },
    { code: 'PR', name: 'Paraná' },
    { code: 'PE', name: 'Pernambuco' },
    { code: 'PI', name: 'Piauí' },
    { code: 'RJ', name: 'Rio de Janeiro' },
    { code: 'RN', name: 'Rio Grande do Norte' },
    { code: 'RS', name: 'Rio Grande do Sul' },
    { code: 'RO', name: 'Rondônia' },
    { code: 'RR', name: 'Roraima' },
    { code: 'SC', name: 'Santa Catarina' },
    { code: 'SP', name: 'São Paulo' },
    { code: 'SE', name: 'Sergipe' },
    { code: 'TO', name: 'Tocantins' }
  ];

  useEffect(() => {
    loadUserHouses();
    if (event) {
      populateForm(event);
    }
  }, [event]);

  useEffect(() => {
    // Auto-fill contact info when house is selected
    if (formData.houseId && userHouses.length > 0) {
      const selectedHouse = userHouses.find(house => house.id === formData.houseId);
      if (selectedHouse && !formData.phone && !formData.whatsapp && !formData.email) {
        setFormData(prev => ({
          ...prev,
          phone: selectedHouse.phone || '',
          whatsapp: selectedHouse.whatsapp || '',
          email: selectedHouse.email || ''
        }));
      }
    }
  }, [formData.houseId, userHouses]);

  const loadUserHouses = async () => {
    try {
      if (user) {
        const houses = await getHousesByOwner(user.uid);
        setUserHouses(houses);
      }
    } catch (error) {
      console.error('Error loading user houses:', error);
    }
  };

  const populateForm = (eventData: Event) => {
    const startDate = eventData.startDate.toDate();
    const endDate = eventData.endDate?.toDate();

    setFormData({
      title: eventData.title,
      description: eventData.description,
      startDate: startDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endDate: endDate ? endDate.toISOString().split('T')[0] : '',
      endTime: endDate ? endDate.toTimeString().slice(0, 5) : '',
      category: eventData.category,
      houseId: eventData.houseId,
      maxParticipants: eventData.maxParticipants?.toString() || '',
      
      address: eventData.location.address,
      city: eventData.location.city,
      state: eventData.location.state,
      
      ticketType: eventData.ticketInfo.type,
      ticketPrice: eventData.ticketInfo.price 
        ? eventData.ticketInfo.price.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })
        : '',
      ticketDescription: eventData.ticketInfo.description || '',
      
      phone: eventData.contactInfo.phone || '',
      whatsapp: eventData.contactInfo.whatsapp || '',
      email: eventData.contactInfo.email || '',
      
      requirements: eventData.requirements || '',
      isPublic: eventData.isPublic
    });

    setExistingImages(eventData.images || []);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else if (name === 'ticketPrice') {
      // Handle currency formatting for price
      const formatted = formatCurrency(value);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number, isExisting = false) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Título é obrigatório';
    if (!formData.description.trim()) return 'Descrição é obrigatória';
    if (!formData.startDate) return 'Data de início é obrigatória';
    if (!formData.startTime) return 'Hora de início é obrigatória';
    if (!formData.category) return 'Categoria é obrigatória';
    if (!formData.houseId) return 'Casa organizadora é obrigatória';
    if (!formData.address.trim()) return 'Endereço é obrigatório';
    if (!formData.city.trim()) return 'Cidade é obrigatória';
    if (!formData.state.trim()) return 'Estado é obrigatório';
    
    // Validate start date is not in the past
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const now = new Date();
    if (startDateTime <= now) {
      return 'Data e hora de início devem ser no futuro';
    }
    
    if (formData.ticketType === 'paid' && !formData.ticketPrice) {
      return 'Preço do ingresso é obrigatório para eventos pagos';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      showToast({
        type: 'error',
        title: 'Erro de validação',
        message: validationError
      });
      return;
    }

    setLoading(true);

    try {
      // Create date objects
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = formData.endDate && formData.endTime 
        ? new Date(`${formData.endDate}T${formData.endTime}`) 
        : undefined;

      const eventData: CreateEventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: startDateTime as any,
        endDate: endDateTime as any,
        category: formData.category,
        houseId: formData.houseId,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        
        location: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim()
        },
        
        ticketInfo: {
          type: formData.ticketType as any,
          price: formData.ticketType === 'paid' && formData.ticketPrice 
            ? parseCurrency(formData.ticketPrice) 
            : undefined,
          description: formData.ticketDescription.trim() || undefined
        },
        
        contactInfo: {
          phone: formData.phone.trim() || undefined,
          whatsapp: formData.whatsapp.trim() || undefined,
          email: formData.email.trim() || undefined
        },
        
        requirements: formData.requirements.trim() || undefined,
        isPublic: formData.isPublic,
        images: existingImages
      };

      let eventId: string;

      if (event) {
        // Update existing event
        await updateEvent(event.id!, eventData);
        eventId = event.id!;
      } else {
        // Create new event
        eventId = await createEvent(eventData);
      }

      // Upload new images
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(file => uploadEventImage(file, eventId));
        const newImageUrls = await Promise.all(uploadPromises);
        
        // Update event with new images
        const allImages = [...existingImages, ...newImageUrls];
        await updateEvent(eventId, { images: allImages });
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving event:', error);
      showToast({
        type: 'error',
        title: 'Erro ao salvar evento',
        message: error.message || 'Tente novamente em alguns instantes'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-form">
      <div className="form-header">
        <h2 className="form-title">
          {event ? 'Editar Evento' : 'Criar Novo Evento'}
        </h2>
        <button onClick={onCancel} className="close-button">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {/* Basic Info */}
        <div className="form-section">
          <h3 className="section-title">Informações Básicas</h3>
          
          <div className="monday-form-group">
            <label className="monday-label">Título do Evento *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="monday-input"
              placeholder="Ex: Cerimônia da Lua Cheia"
              required
            />
          </div>

          <div className="monday-form-group">
            <label className="monday-label">Descrição *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="monday-textarea"
              rows={4}
              placeholder="Descreva o evento, sua importância e o que os participantes podem esperar..."
              required
            />
          </div>

          <div className="form-row">
            <div className="monday-form-group">
              <label className="monday-label">Categoria *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="monday-select"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="monday-form-group">
              <label className="monday-label">Casa Organizadora *</label>
              <select
                name="houseId"
                value={formData.houseId}
                onChange={handleInputChange}
                className="monday-select"
                required
              >
                <option value="">Selecione uma casa</option>
                {userHouses.map(house => (
                  <option key={house.id} value={house.id}>{house.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="form-section">
          <h3 className="section-title">Data e Hora</h3>
          
          <div className="form-row">
            <div className="monday-form-group">
              <label className="monday-label">Data de Início *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="monday-input"
                required
              />
            </div>

            <div className="monday-form-group">
              <label className="monday-label">Hora de Início *</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="monday-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="monday-form-group">
              <label className="monday-label">Data de Término</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="monday-input"
              />
            </div>

            <div className="monday-form-group">
              <label className="monday-label">Hora de Término</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="monday-input"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="form-section">
          <h3 className="section-title">Local</h3>
          
          <div className="monday-form-group">
            <label className="monday-label">Endereço Completo *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="monday-input"
              placeholder="Rua, número, bairro..."
              required
            />
          </div>

          <div className="form-row">
            <div className="monday-form-group">
              <label className="monday-label">Cidade *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="monday-input"
                required
              />
            </div>

            <div className="monday-form-group">
              <label className="monday-label">Estado *</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="monday-select"
                required
              >
                <option value="">Selecione um estado</option>
                {brazilianStates.map(state => (
                  <option key={state.code} value={state.code}>
                    {state.name} ({state.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Ticket Info */}
        <div className="form-section">
          <h3 className="section-title">Informações de Ingresso</h3>
          
          <div className="form-row">
            <div className="monday-form-group">
              <label className="monday-label">Tipo de Ingresso</label>
              <select
                name="ticketType"
                value={formData.ticketType}
                onChange={handleInputChange}
                className="monday-select"
              >
                <option value="free">Gratuito</option>
                <option value="paid">Pago</option>
                <option value="donation">Contribuição</option>
              </select>
            </div>

            {formData.ticketType === 'paid' && (
              <div className="monday-form-group">
                <label className="monday-label">Preço (R$)</label>
                <input
                  type="text"
                  name="ticketPrice"
                  value={formData.ticketPrice}
                  onChange={handleInputChange}
                  className="monday-input"
                  placeholder="R$ 0,00"
                />
                <small className="form-text">Digite apenas números. Ex: 1500 = R$ 15,00</small>
              </div>
            )}

            <div className="monday-form-group">
              <label className="monday-label">Limite de Participantes</label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                className="monday-input"
                min="1"
                placeholder="Deixe vazio para ilimitado"
              />
            </div>
          </div>

          <div className="monday-form-group">
            <label className="monday-label">Observações sobre Ingresso</label>
            <textarea
              name="ticketDescription"
              value={formData.ticketDescription}
              onChange={handleInputChange}
              className="monday-textarea"
              rows={2}
              placeholder="Informações adicionais sobre pagamento, desconto, etc..."
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="form-section">
          <h3 className="section-title">Contato</h3>
          <p className="section-note">
            Os dados de contato são preenchidos automaticamente com as informações da casa selecionada, mas podem ser editados conforme necessário.
          </p>
          
          <div className="form-row">
            <div className="monday-form-group">
              <label className="monday-label">Telefone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="monday-input"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="monday-form-group">
              <label className="monday-label">WhatsApp</label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                className="monday-input"
                placeholder="5511999999999"
              />
            </div>

            <div className="monday-form-group">
              <label className="monday-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="monday-input"
                placeholder="contato@casa.com"
              />
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="form-section">
          <h3 className="section-title">Informações Adicionais</h3>
          
          <div className="monday-form-group">
            <label className="monday-label">Requisitos</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              className="monday-textarea"
              rows={3}
              placeholder="Idade mínima, preparações necessárias, restrições, etc..."
            />
          </div>

          <div className="monday-form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
              />
              <span>Evento público (visível para todos)</span>
            </label>
          </div>
        </div>

        {/* Images */}
        <div className="form-section">
          <h3 className="section-title">Imagens</h3>
          
          <div className="monday-form-group">
            <label className="monday-label">Adicionar Imagens</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="image-preview">
              <h4>Imagens Atuais</h4>
              <div className="images-grid">
                {existingImages.map((image, index) => (
                  <div key={index} className="image-item">
                    <img src={image} alt={`Imagem ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(index, true)}
                      className="remove-image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          {imageFiles.length > 0 && (
            <div className="image-preview">
              <h4>Novas Imagens</h4>
              <div className="images-grid">
                {imageFiles.map((file, index) => (
                  <div key={index} className="image-item">
                    <img src={URL.createObjectURL(file)} alt={`Nova imagem ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(index, false)}
                      className="remove-image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-monday-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-monday"
            disabled={loading}
          >
            {loading ? 'Salvando...' : (event ? 'Atualizar Evento' : 'Criar Evento')}
          </button>
        </div>
      </form>

      <style jsx>{`
        .event-form {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
          max-height: 90vh;
          overflow-y: auto;
          max-width: 800px;
          margin: 0 auto;
        }

        .form-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px;
          border-bottom: 1px solid #e1e5e9;
          background: #fafbfc;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .form-title {
          font-size: 24px;
          font-weight: 600;
          color: #323338;
          margin: 0;
        }

        .close-button {
          background: transparent;
          border: none;
          font-size: 20px;
          color: #676879;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: #f5f6f8;
          color: #323338;
        }

        .form-content {
          padding: 24px;
        }

        .form-section {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        .form-section:last-of-type {
          border-bottom: none;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 16px;
        }

        .section-note {
          font-size: 14px;
          color: #676879;
          margin-bottom: 16px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 6px;
          border-left: 3px solid #0085ff;
        }

        .form-text {
          font-size: 12px;
          color: #676879;
          margin-top: 4px;
          display: block;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
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
          margin: 0;
        }

        .file-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d0d4d9;
          border-radius: 4px;
          font-size: 14px;
          background: white;
        }

        .image-preview {
          margin-top: 16px;
        }

        .image-preview h4 {
          font-size: 14px;
          font-weight: 500;
          color: #323338;
          margin-bottom: 12px;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 12px;
        }

        .image-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
        }

        .image-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-image {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-image:hover {
          background: rgba(255, 0, 0, 0.8);
        }

        .form-actions {
          display: flex;
          gap: 16px;
          justify-content: flex-end;
          padding-top: 24px;
          border-top: 1px solid #e1e5e9;
          margin-top: 32px;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column-reverse;
          }
        }
      `}</style>
    </div>
  );
};

export default EventForm;