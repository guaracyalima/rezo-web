'use client';

import React, { useState } from 'react';
import { Event, deleteEvent } from '../../../services/eventsService';
import { useToast } from '../../../contexts/ToastContext';

interface EventDetailProps {
  event: Event;
  onClose: () => void;
  onEdit?: (event: Event) => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const EventDetail: React.FC<EventDetailProps> = ({
  event,
  onClose,
  onEdit,
  onDelete,
  showActions = true
}) => {
  const { showToast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return '';
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) {
      return;
    }

    try {
      setDeleting(true);
      await deleteEvent(event.id!);
      showToast({
        type: 'success',
        title: 'Evento excluído',
        message: 'O evento foi removido com sucesso'
      });
      onDelete?.();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro ao excluir evento',
        message: error.message || 'Tente novamente em alguns instantes'
      });
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    onEdit?.(event);
  };

  return (
    <div className="event-detail">
      {/* Header */}
      <div className="detail-header">
        <button onClick={onClose} className="close-button">
          ← Voltar
        </button>
        
        {showActions && (
          <div className="header-actions">
            {onEdit && (
              <button onClick={handleEdit} className="btn-edit">
                ✏️ Editar
              </button>
            )}
            {onDelete && (
              <button 
                onClick={handleDelete} 
                disabled={deleting}
                className="btn-delete"
              >
                {deleting ? '🗑️ Excluindo...' : '🗑️ Excluir'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="detail-content">
        {/* Hero Section */}
        <div className="event-hero">
          {event.images && event.images.length > 0 ? (
            <div className="hero-image">
              <img src={event.images[0]} alt={event.title} />
            </div>
          ) : (
            <div className="hero-placeholder">
              <span>📅</span>
            </div>
          )}
          
          <div className="hero-info">
            <div className="event-badges">
              <span className="category-badge">{event.category}</span>
              <span className="visibility-badge">
                {event.isPublic ? '🌍 Público' : '🔒 Privado'}
              </span>
            </div>
            
            <h1 className="event-title">{event.title}</h1>
            <p className="event-description">{event.description}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="details-grid">
          {/* Date & Time */}
          <div className="detail-card">
            <h3 className="card-title">📅 Data e Hora</h3>
            <div className="card-content">
              <div className="detail-item">
                <strong>Início:</strong>
                <span>{formatDate(event.startDate)} às {formatTime(event.startDate)}</span>
              </div>
              {event.endDate && (
                <div className="detail-item">
                  <strong>Término:</strong>
                  <span>{formatDate(event.endDate)} às {formatTime(event.endDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="detail-card">
            <h3 className="card-title">📍 Local</h3>
            <div className="card-content">
              <div className="detail-item">
                <strong>Endereço:</strong>
                <span>{event.location.address}</span>
              </div>
              <div className="detail-item">
                <strong>Cidade:</strong>
                <span>{event.location.city}, {event.location.state}</span>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="detail-card">
            <h3 className="card-title">👥 Participantes</h3>
            <div className="card-content">
              <div className="detail-item">
                <strong>Confirmados:</strong>
                <span>{event.currentParticipants}</span>
              </div>
              {event.maxParticipants && (
                <div className="detail-item">
                  <strong>Limite:</strong>
                  <span>{event.maxParticipants} pessoas</span>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Info */}
          <div className="detail-card">
            <h3 className="card-title">🎫 Ingresso</h3>
            <div className="card-content">
              <div className="detail-item">
                <strong>Tipo:</strong>
                <span>
                  {event.ticketInfo.type === 'free' && '🆓 Gratuito'}
                  {event.ticketInfo.type === 'paid' && `💰 ${formatPrice(event.ticketInfo.price)}`}
                  {event.ticketInfo.type === 'donation' && '🙏 Contribuição'}
                </span>
              </div>
              {event.ticketInfo.description && (
                <div className="detail-item">
                  <strong>Observações:</strong>
                  <span>{event.ticketInfo.description}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="detail-card">
            <h3 className="card-title">📞 Contato</h3>
            <div className="card-content">
              {event.contactInfo.phone && (
                <div className="detail-item">
                  <strong>Telefone:</strong>
                  <span>{event.contactInfo.phone}</span>
                </div>
              )}
              {event.contactInfo.whatsapp && (
                <div className="detail-item">
                  <strong>WhatsApp:</strong>
                  <a 
                    href={`https://wa.me/${event.contactInfo.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-link"
                  >
                    {event.contactInfo.whatsapp}
                  </a>
                </div>
              )}
              {event.contactInfo.email && (
                <div className="detail-item">
                  <strong>Email:</strong>
                  <a href={`mailto:${event.contactInfo.email}`} className="email-link">
                    {event.contactInfo.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Requirements */}
          {event.requirements && (
            <div className="detail-card">
              <h3 className="card-title">📋 Requisitos</h3>
              <div className="card-content">
                <p>{event.requirements}</p>
              </div>
            </div>
          )}
        </div>

        {/* Image Gallery */}
        {event.images && event.images.length > 1 && (
          <div className="image-gallery">
            <h3 className="gallery-title">🖼️ Galeria de Imagens</h3>
            <div className="gallery-grid">
              {event.images.slice(1).map((image, index) => (
                <div key={index} className="gallery-item">
                  <img src={image} alt={`Imagem ${index + 2}`} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .event-detail {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          max-height: 90vh;
          overflow-y: auto;
        }

        .detail-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #e1e5e9;
          background: #fafbfc;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .close-button {
          background: transparent;
          border: 1px solid #d0d4d9;
          color: #323338;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          border-color: #0085ff;
          color: #0085ff;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn-edit, .btn-delete {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-edit {
          background: #0085ff;
          color: white;
          border: none;
        }

        .btn-edit:hover {
          background: #0073e6;
        }

        .btn-delete {
          background: #ff3333;
          color: white;
          border: none;
        }

        .btn-delete:hover:not(:disabled) {
          background: #e60000;
        }

        .btn-delete:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .detail-content {
          padding: 24px;
        }

        .event-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 40px;
          background: #f8f9fa;
          border-radius: 12px;
          overflow: hidden;
        }

        .hero-image {
          height: 300px;
        }

        .hero-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-placeholder {
          height: 300px;
          background: linear-gradient(45deg, #f1f3f4, #e8eaed);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 80px;
          color: #676879;
        }

        .hero-info {
          padding: 32px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .event-badges {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .category-badge, .visibility-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .category-badge {
          background: #0085ff;
          color: white;
        }

        .visibility-badge {
          background: #00ca72;
          color: white;
        }

        .event-title {
          font-size: 32px;
          font-weight: 700;
          color: #323338;
          margin-bottom: 16px;
          line-height: 1.2;
        }

        .event-description {
          font-size: 16px;
          color: #676879;
          line-height: 1.6;
          margin: 0;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .detail-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e1e5e9;
        }

        .card-title {
          font-size: 18px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 16px;
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-item strong {
          color: #323338;
          font-size: 14px;
          font-weight: 500;
        }

        .detail-item span, .detail-item p {
          color: #676879;
          font-size: 14px;
          line-height: 1.5;
        }

        .whatsapp-link, .email-link {
          color: #0085ff;
          text-decoration: none;
          font-size: 14px;
        }

        .whatsapp-link:hover, .email-link:hover {
          text-decoration: underline;
        }

        .image-gallery {
          margin-top: 40px;
        }

        .gallery-title {
          font-size: 20px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 20px;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .gallery-item {
          border-radius: 8px;
          overflow: hidden;
          aspect-ratio: 1;
        }

        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .gallery-item:hover img {
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .detail-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .event-hero {
            grid-template-columns: 1fr;
          }

          .hero-info {
            padding: 24px;
          }

          .event-title {
            font-size: 24px;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EventDetail;