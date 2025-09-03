import React, { useState } from 'react';
import { Service, deleteService } from '../../../services/servicesService';
import { useToast } from '../../../contexts/ToastContext';
import ServiceShare from '../../services/ServiceShare';

interface ServiceDetailProps {
  service: Service;
  onClose: () => void;
  onEdit?: (service: Service) => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({
  service,
  onClose,
  onEdit,
  onDelete,
  showActions = false
}) => {
  const { showToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDuration = (minutes: number) => {
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

  const getExperienceLevelLabel = (level: string) => {
    const labels = {
      'beginner': 'Iniciante',
      'intermediate': 'Intermediário',
      'advanced': 'Avançado',
      'all': 'Todos os níveis'
    };
    return labels[level as keyof typeof labels] || level;
  };

  const handleDelete = async () => {
    if (!service.id) return;
    
    setDeleting(true);
    try {
      await deleteService(service.id);
      showToast({
        type: 'success',
        title: 'Serviço excluído',
        message: 'O serviço foi removido com sucesso'
      });
      onDelete?.();
    } catch (error: any) {
      console.error('Error deleting service:', error);
      showToast({
        type: 'error',
        title: 'Erro ao excluir',
        message: error.message || 'Tente novamente em alguns instantes'
      });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="service-detail">
      {/* Header */}
      <div className="detail-header">
        <div className="header-left">
          <button onClick={onClose} className="back-btn">
            ← Voltar
          </button>
          <div className="header-info">
            <h1 className="service-title">{service.title}</h1>
            <div className="service-badges">
              <span className="category-badge">{service.category}</span>
              {service.isOnline && (
                <span className="online-badge">💻 Online</span>
              )}
              {service.isInPerson && (
                <span className="inperson-badge">🏠 Presencial</span>
              )}
              {service.isFeatured && (
                <span className="featured-badge">⭐ Destaque</span>
              )}
              {!service.isActive && (
                <span className="inactive-badge">⏸️ Inativo</span>
              )}
            </div>
          </div>
        </div>

        <div className="header-right">
          <ServiceShare service={service} />
          
          {showActions && (
            <div className="detail-actions">
              {onEdit && (
                <button 
                  onClick={() => {
                    console.log('Edit button clicked in ServiceDetail');
                    onEdit(service);
                  }}
                  className="action-btn edit-btn"
                >
                  ✏️ Editar Atendimento
                </button>
              )}
              
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="action-btn delete-btn"
              >
                🗑️ Excluir Atendimento
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="detail-content">
        {/* Image Gallery */}
        {service.images && service.images.length > 0 && (
          <div className="image-gallery">
            <div className="main-image">
              <img 
                src={service.images[selectedImageIndex]} 
                alt={service.title}
              />
            </div>
            
            {service.images.length > 1 && (
              <div className="image-thumbnails">
                {service.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                  >
                    <img src={image} alt={`${service.title} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Service Information */}
        <div className="service-info">
          {/* Basic Info */}
          <div className="info-section">
            <h2>📋 Informações do Atendimento</h2>
            
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Preço Base:</span>
                <span className="info-value price">{formatPrice(service.basePrice)}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Duração:</span>
                <span className="info-value">{formatDuration(service.duration)}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Nível:</span>
                <span className="info-value">{getExperienceLevelLabel(service.experienceLevel)}</span>
              </div>

              {service.maxParticipants && (
                <div className="info-item">
                  <span className="info-label">Máx. Participantes:</span>
                  <span className="info-value">{service.maxParticipants} pessoas</span>
                </div>
              )}

              <div className="info-item">
                <span className="info-label">Modalidade:</span>
                <span className="info-value">
                  {service.isOnline && service.isInPerson ? 'Online e Presencial' :
                   service.isOnline ? 'Apenas Online' : 'Apenas Presencial'}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className={`info-value status ${service.isActive ? 'active' : 'inactive'}`}>
                  {service.isActive ? '✅ Ativo' : '⏸️ Inativo'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="info-section">
            <h2>📝 Descrição</h2>
            {service.shortDescription && (
              <div className="short-description">
                <strong>{service.shortDescription}</strong>
              </div>
            )}
            <div className="description">
              {service.description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Requirements */}
          {service.requirements && service.requirements.length > 0 && (
            <div className="info-section">
              <h2>📋 Pré-requisitos</h2>
              <ul className="requirements-list">
                {service.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
          )}

          {/* What to Expect */}
          {service.whatToExpect && service.whatToExpect.length > 0 && (
            <div className="info-section">
              <h2>✨ O que Esperar</h2>
              <ul className="expectations-list">
                {service.whatToExpect.map((expectation, index) => (
                  <li key={index}>{expectation}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Included Materials */}
          {service.includedMaterials && service.includedMaterials.length > 0 && (
            <div className="info-section">
              <h2>🎁 Materiais Inclusos</h2>
              <ul className="materials-list">
                {service.includedMaterials.map((material, index) => (
                  <li key={index}>{material}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <div className="info-section">
              <h2>🏷️ Tags</h2>
              <div className="tags-container">
                {service.tags.map((tag, index) => (
                  <span key={index} className="tag">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {service.languages && service.languages.length > 0 && (
            <div className="info-section">
              <h2>🌍 Idiomas</h2>
              <div className="languages-container">
                {service.languages.map((language, index) => (
                  <span key={index} className="language">{language}</span>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          {service.location && service.isInPerson && (
            <div className="info-section">
              <h2>📍 Localização</h2>
              <div className="location-info">
                {service.location.address && (
                  <p><strong>Endereço:</strong> {service.location.address}</p>
                )}
                {service.location.city && (
                  <p><strong>Cidade:</strong> {service.location.city}</p>
                )}
                {service.location.state && (
                  <p><strong>Estado:</strong> {service.location.state}</p>
                )}
                {service.location.isFlexible && (
                  <p className="flexible-note">📍 Local flexível (pode ser acordado)</p>
                )}
              </div>
            </div>
          )}

          {/* Policies */}
          {(service.cancellationPolicy || service.refundPolicy) && (
            <div className="info-section">
              <h2>📜 Políticas</h2>
              {service.cancellationPolicy && (
                <div className="policy">
                  <h3>Política de Cancelamento</h3>
                  <p>{service.cancellationPolicy}</p>
                </div>
              )}
              {service.refundPolicy && (
                <div className="policy">
                  <h3>Política de Reembolso</h3>
                  <p>{service.refundPolicy}</p>
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          <div className="info-section">
            <h2>⚙️ Configurações</h2>
            <div className="settings-grid">
              <div className="setting-item">
                <span className="setting-label">Agendamentos:</span>
                <span className={`setting-value ${service.allowBooking ? 'enabled' : 'disabled'}`}>
                  {service.allowBooking ? '✅ Permitidos' : '❌ Desabilitados'}
                </span>
              </div>
              
              <div className="setting-item">
                <span className="setting-label">Aprovação:</span>
                <span className={`setting-value ${service.requiresApproval ? 'required' : 'not-required'}`}>
                  {service.requiresApproval ? '✅ Requerida' : '❌ Não requerida'}
                </span>
              </div>
              
              <div className="setting-item">
                <span className="setting-label">Destaque:</span>
                <span className={`setting-value ${service.isFeatured ? 'featured' : 'normal'}`}>
                  {service.isFeatured ? '⭐ Em destaque' : '📄 Normal'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir o atendimento "<strong>{service.title}</strong>"?</p>
            <p className="warning">Esta ação não pode ser desfeita.</p>
            
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="btn-cancel"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete} 
                className="btn-delete"
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Excluir Serviço'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .service-detail {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px;
          border-bottom: 1px solid #e1e5e9;
          background: #fafbfc;
        }

        .header-left {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          flex: 1;
        }

        .header-right {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .back-btn {
          background: none;
          border: 1px solid #d0d4d9;
          padding: 8px 16px;
          border-radius: 6px;
          color: #676879;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          background: #f5f6f8;
        }

        .header-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .service-title {
          font-size: 28px;
          font-weight: 600;
          color: #323338;
          margin: 0;
          line-height: 1.2;
        }

        .service-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .category-badge, .online-badge, .inperson-badge, .featured-badge, .inactive-badge {
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }

        .category-badge {
          background: #e1e5e9;
          color: #676879;
        }

        .online-badge {
          background: #0085ff;
          color: white;
        }

        .inperson-badge {
          background: #00ca72;
          color: white;
        }

        .featured-badge {
          background: #ff6b35;
          color: white;
        }

        .inactive-badge {
          background: #95a5a6;
          color: white;
        }

        .detail-actions {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          padding: 12px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .edit-btn {
          background: #ffcb00;
          color: #323338;
        }

        .edit-btn:hover {
          background: #e6b800;
        }

        .delete-btn {
          background: #ff3333;
          color: white;
        }

        .delete-btn:hover {
          background: #e02e2e;
        }

        .detail-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .image-gallery {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .main-image {
          width: 100%;
          height: 300px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-thumbnails {
          display: flex;
          gap: 12px;
          overflow-x: auto;
        }

        .thumbnail {
          flex-shrink: 0;
          width: 80px;
          height: 80px;
          border: 3px solid transparent;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          background: none;
          transition: all 0.2s ease;
        }

        .thumbnail.active {
          border-color: #0085ff;
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .service-info {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .info-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }

        .info-section h2 {
          font-size: 18px;
          font-weight: 600;
          color: #323338;
          margin: 0 0 16px 0;
        }

        .info-grid, .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .info-item, .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e1e5e9;
        }

        .info-label, .setting-label {
          font-weight: 500;
          color: #676879;
        }

        .info-value, .setting-value {
          font-weight: 600;
          color: #323338;
        }

        .info-value.price {
          color: #00ca72;
          font-size: 18px;
        }

        .status.active, .setting-value.enabled, .setting-value.featured {
          color: #00ca72;
        }

        .status.inactive, .setting-value.disabled {
          color: #ff3333;
        }

        .setting-value.required {
          color: #ffcb00;
        }

        .short-description {
          background: white;
          padding: 16px;
          border-radius: 6px;
          border-left: 4px solid #0085ff;
          margin-bottom: 16px;
          font-size: 16px;
          color: #323338;
        }

        .description p {
          color: #676879;
          line-height: 1.6;
          margin-bottom: 12px;
        }

        .requirements-list, .expectations-list, .materials-list {
          background: white;
          padding: 16px;
          border-radius: 6px;
          margin: 0;
        }

        .requirements-list li, .expectations-list li, .materials-list li {
          color: #676879;
          margin-bottom: 8px;
          padding-left: 8px;
        }

        .tags-container, .languages-container {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tag {
          background: #0085ff;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .language {
          background: #00ca72;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .location-info p {
          color: #676879;
          margin-bottom: 8px;
        }

        .flexible-note {
          color: #0085ff !important;
          font-style: italic;
        }

        .policy {
          background: white;
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .policy h3 {
          font-size: 14px;
          font-weight: 600;
          color: #323338;
          margin: 0 0 8px 0;
        }

        .policy p {
          color: #676879;
          margin: 0;
          line-height: 1.4;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          max-width: 400px;
          width: 90%;
        }

        .modal h3 {
          font-size: 20px;
          font-weight: 600;
          color: #323338;
          margin: 0 0 16px 0;
        }

        .modal p {
          color: #676879;
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .warning {
          color: #ff3333 !important;
          font-weight: 500;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .btn-cancel {
          flex: 1;
          background: white;
          color: #676879;
          border: 1px solid #d0d4d9;
          padding: 12px 20px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #f5f6f8;
        }

        .btn-delete {
          flex: 1;
          background: #ff3333;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-delete:hover:not(:disabled) {
          background: #e02e2e;
        }

        .btn-delete:disabled, .btn-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .detail-header {
            flex-direction: column;
            gap: 16px;
          }

          .header-left {
            flex-direction: column;
            align-items: stretch;
          }

          .detail-actions {
            justify-content: stretch;
          }

          .service-title {
            font-size: 24px;
          }

          .info-grid, .settings-grid {
            grid-template-columns: 1fr;
          }

          .main-image {
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceDetail;